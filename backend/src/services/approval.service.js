const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

class ApprovalWorkflowService {

  // ============================================
  // WORKFLOW INITIALIZATION
  // ============================================

  async initiateWorkflow(taskId, workflowType, userId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Determine approval chain
      const approvalChain = await this.determineApprovalChain(task);

      // Create workflow
      const workflow = await prisma.taskApprovalWorkflow.create({
        data: {
          workflowType,
          currentSequence: 1,
          overallStatus: 'PENDING',
          initiatedBy: userId
        }
      });

      // Create approval steps
      await prisma.taskApprovalStep.createMany({
        data: approvalChain.map(step => ({
          workflowId: workflow.id,
          ...step
        }))
      });

      // Update task
      await prisma.task.update({
        where: { id: taskId },
        data: {
          approvalWorkflowId: workflow.id,
          status: 'PENDING_APPROVAL'
        }
      });

      // Notify first approver
      await this.notifyApprover(workflow.id, 1);

      logger.info(`Approval workflow initiated for task ${taskId}`);
      return workflow;
    } catch (error) {
      logger.error('Error initiating workflow:', error);
      throw error;
    }
  }

  async determineApprovalChain(task) {
    const chain = [];
    let sequence = 1;

    // Technical review (always required)
    chain.push({
      sequence: sequence++,
      role: 'senior_engineer',
      approverId: await this.getApproverByRole(task.projectId, 'senior_engineer'),
      approverName: 'Senior Engineer',
      approvalType: 'technical_review',
      status: 'PENDING',
      required: true
    });

    // Budget approval (if cost > threshold)
    if (task.estimatedCost > 100000) {
      chain.push({
        sequence: sequence++,
        role: 'finance_manager',
        approverId: await this.getApproverByRole(task.projectId, 'finance_manager'),
        approverName: 'Finance Manager',
        approvalType: 'budget_approval',
        status: 'PENDING',
        required: true
      });
    }

    // PM final approval
    chain.push({
      sequence: sequence++,
      role: 'project_manager',
      approverId: task.project.createdBy, // Project creator is PM
      approverName: 'Project Manager',
      approvalType: 'final_approval',
      status: 'PENDING',
      required: true,
      canOverride: true
    });

    return chain;
  }

  async getApproverByRole(projectId, role) {
    try {
      const member = await prisma.projectMember.findFirst({
        where: {
          projectId,
          role: role,
          leftAt: null
        },
        select: { userId: true }
      });

      return member?.userId || null;
    } catch (error) {
      logger.error('Error getting approver by role:', error);
      return null;
    }
  }

  // ============================================
  // APPROVAL PROCESSING
  // ============================================

  async processApproval(workflowId, sequence, approverId, action, comments, attachments = null) {
    try {
      const workflow = await prisma.taskApprovalWorkflow.findUnique({
        where: { id: workflowId },
        include: {
          approvalSteps: true,
          tasks: { select: { id: true } }
        }
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const approvalStep = workflow.approvalSteps.find(s => s.sequence === sequence);

      if (!approvalStep || approvalStep.approverId !== approverId) {
        throw new Error('Unauthorized: You are not the designated approver for this step');
      }

      if (!['APPROVED', 'REJECTED', 'CONDITIONAL_APPROVAL', 'REVISION_REQUIRED'].includes(action)) {
        throw new Error('Invalid approval action');
      }

      // Update approval step
      await prisma.taskApprovalStep.update({
        where: { id: approvalStep.id },
        data: {
          status: action,
          approvedAt: new Date(),
          comments,
          attachments: attachments ? JSON.stringify(attachments) : null
        }
      });

      // Handle different actions
      if (action === 'APPROVED') {
        await this.handleApproved(workflow, sequence);
      } else if (action === 'REJECTED') {
        await this.handleRejected(workflow, sequence, comments);
      } else if (action === 'REVISION_REQUIRED') {
        await this.handleRevisionRequest(workflow, sequence, comments);
      }

      logger.info(`Approval step ${sequence} for workflow ${workflowId} ${action}`);
    } catch (error) {
      logger.error('Error processing approval:', error);
      throw error;
    }
  }

  async handleApproved(workflow, sequence) {
    try {
      const steps = await prisma.taskApprovalStep.findMany({
        where: { workflowId: workflow.id },
        orderBy: { sequence: 'asc' }
      });

      // Find next pending step
      const nextStep = steps.find(s => s.sequence > sequence && s.status === 'PENDING');

      if (nextStep) {
        // Move to next step
        await prisma.taskApprovalWorkflow.update({
          where: { id: workflow.id },
          data: {
            currentSequence: nextStep.sequence,
            overallStatus: 'IN_PROGRESS'
          }
        });

        // Notify next approver
        await this.notifyApprover(workflow.id, nextStep.sequence);
      } else {
        // All steps approved - complete workflow
        await this.completeWorkflow(workflow.id);
      }
    } catch (error) {
      logger.error('Error handling approved:', error);
      throw error;
    }
  }

  async handleRejected(workflow, sequence, reason) {
    try {
      // Mark workflow as rejected
      await prisma.taskApprovalWorkflow.update({
        where: { id: workflow.id },
        data: {
          overallStatus: 'REJECTED',
          rejectedAt: new Date(),
          rejectionReason: reason
        }
      });

      // Update all associated tasks
      const tasks = await prisma.task.findMany({
        where: { approvalWorkflowId: workflow.id }
      });

      for (const task of tasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: 'REJECTED'
          }
        });

        // Notify task creator
        await notificationService.send({
          userId: task.createdBy,
          type: 'task_rejected',
          title: 'Task Rejected',
          message: `Your task has been rejected. Reason: ${reason}`,
          actionUrl: `/tasks/${task.id}`,
          priority: 'high'
        });
      }

      logger.info(`Workflow ${workflow.id} rejected at step ${sequence}`);
    } catch (error) {
      logger.error('Error handling rejected:', error);
      throw error;
    }
  }

  async handleRevisionRequest(workflow, sequence, comments) {
    try {
      await prisma.taskApprovalWorkflow.update({
        where: { id: workflow.id },
        data: {
          overallStatus: 'REVISION_REQUIRED'
        }
      });

      // Notify task creator
      const tasks = await prisma.task.findMany({
        where: { approvalWorkflowId: workflow.id }
      });

      for (const task of tasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: 'DRAFT'
          }
        });

        await notificationService.send({
          userId: task.createdBy,
          type: 'task_revision_required',
          title: 'Task Revision Required',
          message: `Your task needs revision. Comments: ${comments}`,
          actionUrl: `/tasks/${task.id}`,
          priority: 'high'
        });
      }
    } catch (error) {
      logger.error('Error handling revision request:', error);
      throw error;
    }
  }

  async completeWorkflow(workflowId) {
    try {
      // Mark workflow as approved
      await prisma.taskApprovalWorkflow.update({
        where: { id: workflowId },
        data: {
          overallStatus: 'APPROVED',
          approvedAt: new Date()
        }
      });

      // Update all associated tasks
      const tasks = await prisma.task.findMany({
        where: { approvalWorkflowId: workflowId }
      });

      for (const task of tasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            availableForAssignment: true
          }
        });

        // Reserve resources
        await this.finalizeResourceReservations(task.id);

        // Notify task creator
        await notificationService.send({
          userId: task.createdBy,
          type: 'task_approved',
          title: 'Task Approved',
          message: 'Your task has been fully approved and is ready for assignment',
          actionUrl: `/tasks/${task.id}`,
          priority: 'high'
        });
      }

      logger.info(`Workflow ${workflowId} completed successfully`);
    } catch (error) {
      logger.error('Error completing workflow:', error);
      throw error;
    }
  }

  async finalizeResourceReservations(taskId) {
    try {
      // Update task materials to reserved status
      await prisma.taskMaterial.updateMany({
        where: {
          taskId,
          inventoryAvailable: true,
          reservationStatus: 'PENDING'
        },
        data: {
          reservationStatus: 'RESERVED',
          reservationDate: new Date()
        }
      });

      logger.info(`Resources finalized for task ${taskId}`);
    } catch (error) {
      logger.error('Error finalizing resources:', error);
    }
  }

  async notifyApprover(workflowId, sequence) {
    try {
      const step = await prisma.taskApprovalStep.findFirst({
        where: {
          workflowId,
          sequence
        }
      });

      if (!step) return;

      const workflow = await prisma.taskApprovalWorkflow.findUnique({
        where: { id: workflowId },
        include: {
          tasks: { select: { id: true, name: true } }
        }
      });

      await notificationService.send({
        userId: step.approverId,
        type: 'approval_required',
        title: 'Approval Required',
        message: `Please review and approve: ${workflow.tasks[0]?.name || 'Task'}`,
        actionUrl: `/approvals/${workflowId}`,
        priority: 'high'
      });

      // Update submitted time
      await prisma.taskApprovalStep.update({
        where: { id: step.id },
        data: {
          submittedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error notifying approver:', error);
    }
  }

  // ============================================
  // ESCALATION & REMINDERS
  // ============================================

  async checkEscalations() {
    try {
      const pendingWorkflows = await prisma.taskApprovalWorkflow.findMany({
        where: {
          overallStatus: { in: ['PENDING', 'IN_PROGRESS'] },
          escalationEnabled: true
        },
        include: {
          approvalSteps: true
        }
      });

      for (const workflow of pendingWorkflows) {
        const currentStep = workflow.approvalSteps.find(
          s => s.sequence === workflow.currentSequence && s.status === 'PENDING'
        );

        if (!currentStep || !currentStep.submittedAt) continue;

        const hoursElapsed = (Date.now() - new Date(currentStep.submittedAt).getTime()) / (1000 * 60 * 60);

        // Send reminder after 24 hours
        if (hoursElapsed >= 24 && hoursElapsed < 48 && !currentStep.reminderSent) {
          await this.sendReminder(workflow.id, currentStep.id);
        }

        // Escalate after 48 hours
        if (hoursElapsed >= workflow.slaHours && !currentStep.escalated) {
          await this.escalateApproval(workflow.id, currentStep.id);
        }
      }

      logger.info('Escalation check completed');
    } catch (error) {
      logger.error('Error checking escalations:', error);
    }
  }

  async sendReminder(workflowId, stepId) {
    try {
      const step = await prisma.taskApprovalStep.findUnique({
        where: { id: stepId }
      });

      if (!step) return;

      await notificationService.send({
        userId: step.approverId,
        type: 'approval_reminder',
        title: 'Approval Reminder',
        message: 'You have a pending approval request',
        actionUrl: `/approvals/${workflowId}`,
        priority: 'high'
      });

      await prisma.taskApprovalStep.update({
        where: { id: stepId },
        data: { reminderSent: true }
      });

      logger.info(`Reminder sent for approval step ${stepId}`);
    } catch (error) {
      logger.error('Error sending reminder:', error);
    }
  }

  async escalateApproval(workflowId, stepId) {
    try {
      const step = await prisma.taskApprovalStep.findUnique({
        where: { id: stepId },
        include: {
          workflow: true
        }
      });

      if (!step) return;

      // Find approver's superior
      const approver = await prisma.user.findUnique({
        where: { id: step.approverId }
      });

      // For now, escalate to workflow initiator (could be improved)
      const escalateTo = step.workflow.initiatedBy;

      await notificationService.send({
        userId: escalateTo,
        type: 'approval_escalation',
        title: 'Approval Escalation',
        message: `Approval pending for 48+ hours. Please review or delegate.`,
        actionUrl: `/approvals/${workflowId}`,
        priority: 'urgent'
      });

      await prisma.taskApprovalStep.update({
        where: { id: stepId },
        data: {
          escalated: true,
          escalatedTo,
          escalatedAt: new Date()
        }
      });

      logger.info(`Approval escalated for step ${stepId}`);
    } catch (error) {
      logger.error('Error escalating approval:', error);
    }
  }

  // ============================================
  // QUERIES
  // ============================================

  async getPendingApprovals(userId) {
    try {
      const approvals = await prisma.taskApprovalStep.findMany({
        where: {
          approverId: userId,
          status: 'PENDING'
        },
        include: {
          workflow: {
            include: {
              tasks: {
                select: {
                  id: true,
                  name: true,
                  project: { select: { id: true, name: true } }
                }
              }
            }
          }
        },
        orderBy: { submittedAt: 'asc' }
      });

      return approvals;
    } catch (error) {
      logger.error('Error fetching pending approvals:', error);
      throw error;
    }
  }
}

module.exports = new ApprovalWorkflowService();
