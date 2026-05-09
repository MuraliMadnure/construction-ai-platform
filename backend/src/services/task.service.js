const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');
const aiService = require('./ai.service');

class TaskManagementService {

  // ============================================
  // TASK CRUD OPERATIONS
  // ============================================

  async createTask(data, userId) {
    try {
      const task = await prisma.task.create({
        data: {
          ...data,
          createdBy: userId,
          status: 'DRAFT'
        },
        include: {
          project: true,
          phase: true,
          subphase: true,
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      logger.info(`Task created: ${task.id} by user: ${userId}`);

      // Create default checklists if provided
      if (data.checklists && data.checklists.length > 0) {
        await this.createChecklists(task.id, data.checklists);
      }

      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  async getTaskById(taskId, includeRelations = true) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: includeRelations ? {
          project: true,
          phase: true,
          subphase: true,
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignments: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
          },
          dependencies: {
            include: {
              dependsOnTask: { select: { id: true, name: true, status: true } }
            }
          },
          dependents: {
            include: {
              task: { select: { id: true, name: true, status: true } }
            }
          },
          taskMaterials: true,
          taskResources: true,
          taskChecklists: true,
          taskAlerts: {
            where: { dismissedAt: null },
            orderBy: { createdAt: 'desc' }
          },
          dailyProgressReports: {
            orderBy: { reportDate: 'desc' },
            take: 5
          }
        } : undefined
      });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    } catch (error) {
      logger.error('Error fetching task:', error);
      throw error;
    }
  }

  async updateTask(taskId, data, userId) {
    try {
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          project: true,
          assignee: true
        }
      });

      logger.info(`Task updated: ${taskId} by user: ${userId}`);

      return task;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId, userId) {
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          deletedAt: new Date(),
          status: 'CANCELLED'
        }
      });

      logger.info(`Task deleted: ${taskId} by user: ${userId}`);
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }

  // ============================================
  // PHASE & SUBPHASE MANAGEMENT
  // ============================================

  async createPhase(projectId, data, userId) {
    try {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          ...data
        }
      });

      logger.info(`Phase created: ${phase.id} for project: ${projectId}`);
      return phase;
    } catch (error) {
      logger.error('Error creating phase:', error);
      throw error;
    }
  }

  async createSubphase(phaseId, data, userId) {
    try {
      const subphase = await prisma.subphase.create({
        data: {
          phaseId,
          ...data
        }
      });

      logger.info(`Subphase created: ${subphase.id} for phase: ${phaseId}`);
      return subphase;
    } catch (error) {
      logger.error('Error creating subphase:', error);
      throw error;
    }
  }

  async getProjectPhases(projectId) {
    try {
      const phases = await prisma.phase.findMany({
        where: { projectId },
        include: {
          subphases: {
            include: {
              tasks: {
                where: { deletedAt: null }
              }
            },
            orderBy: { subphaseOrder: 'asc' }
          },
          tasks: {
            where: { deletedAt: null, subphaseId: null }
          }
        },
        orderBy: { phaseOrder: 'asc' }
      });

      return phases;
    } catch (error) {
      logger.error('Error fetching project phases:', error);
      throw error;
    }
  }

  // ============================================
  // TASK ASSIGNMENT
  // ============================================

  async assignTask(taskId, userId, assignedBy, assignmentData = {}) {
    try {
      // Check if user is available
      const availability = await this.checkUserAvailability(userId, assignmentData.startDate, assignmentData.endDate);

      if (!availability.available && assignmentData.forceAssign !== true) {
        throw new Error(`User is not available. ${availability.reason}`);
      }

      // Create assignment
      const assignment = await prisma.taskAssignment.create({
        data: {
          taskId,
          userId,
          assignedBy,
          assignmentType: assignmentData.assignmentType || 'DIRECT',
          allocationPercent: assignmentData.allocationPercent || 100,
          instructions: assignmentData.instructions,
          acceptanceRequired: assignmentData.acceptanceRequired || false,
          acceptanceStatus: 'PENDING'
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          task: { select: { id: true, name: true, projectId: true } }
        }
      });

      // Update task
      await prisma.task.update({
        where: { id: taskId },
        data: {
          assignedTo: userId,
          status: assignmentData.acceptanceRequired ? 'ASSIGNED' : 'READY_TO_START'
        }
      });

      // Send notification
      await notificationService.send({
        userId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${assignment.task.name}`,
        actionUrl: `/projects/${assignment.task.projectId}/tasks/${taskId}`,
        priority: 'high'
      });

      logger.info(`Task ${taskId} assigned to user ${userId} by ${assignedBy}`);
      return assignment;
    } catch (error) {
      logger.error('Error assigning task:', error);
      throw error;
    }
  }

  async acceptTaskAssignment(taskId, userId, comments) {
    try {
      const assignment = await prisma.taskAssignment.update({
        where: {
          taskId_userId: {
            taskId,
            userId
          }
        },
        data: {
          acceptanceStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptanceComments: comments
        },
        include: {
          task: true,
          assignedByUser: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'READY_TO_START' }
      });

      // Notify assigner
      await notificationService.send({
        userId: assignment.assignedBy,
        type: 'task_accepted',
        title: 'Task Assignment Accepted',
        message: `${assignment.user.firstName} accepted the task assignment`,
        actionUrl: `/tasks/${taskId}`
      });

      return assignment;
    } catch (error) {
      logger.error('Error accepting task assignment:', error);
      throw error;
    }
  }

  async declineTaskAssignment(taskId, userId, reason) {
    try {
      const assignment = await prisma.taskAssignment.update({
        where: {
          taskId_userId: {
            taskId,
            userId
          }
        },
        data: {
          acceptanceStatus: 'DECLINED',
          declineReason: reason,
          status: 'declined'
        },
        include: {
          task: true,
          assignedByUser: { select: { id: true } }
        }
      });

      await prisma.task.update({
        where: { id: taskId },
        data: {
          assignedTo: null,
          status: 'PENDING_ASSIGNMENT'
        }
      });

      // Notify assigner
      await notificationService.send({
        userId: assignment.assignedBy,
        type: 'task_declined',
        title: 'Task Assignment Declined',
        message: `Task assignment declined. Reason: ${reason}`,
        actionUrl: `/tasks/${taskId}`,
        priority: 'high'
      });

      return assignment;
    } catch (error) {
      logger.error('Error declining task assignment:', error);
      throw error;
    }
  }

  async checkUserAvailability(userId, startDate, endDate) {
    try {
      // Check existing task assignments
      const existingTasks = await prisma.task.count({
        where: {
          assignedTo: userId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS', 'READY_TO_START'] },
          OR: [
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: startDate } }
              ]
            }
          ]
        }
      });

      // Check leave records (if you have a leave table)
      // const leaves = await prisma.userLeave.count({ ... });

      return {
        available: existingTasks < 5, // Max 5 concurrent tasks
        currentTaskCount: existingTasks,
        reason: existingTasks >= 5 ? 'User has too many concurrent tasks' : null
      };
    } catch (error) {
      logger.error('Error checking user availability:', error);
      return { available: true, currentTaskCount: 0 };
    }
  }

  // ============================================
  // SMART ASSIGNMENT SUGGESTIONS
  // ============================================

  async suggestAssignees(taskId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true }
      });

      // Get project team members
      const teamMembers = await prisma.projectMember.findMany({
        where: {
          projectId: task.projectId,
          leftAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true
            }
          }
        }
      });

      // Score each team member
      const scoredMembers = await Promise.all(
        teamMembers.map(async (member) => {
          const score = await this.calculateAssignmentScore(member.user, task);
          return {
            user: member.user,
            role: member.role,
            score,
            recommendation: this.getRecommendationReason(score)
          };
        })
      );

      // Sort by score (descending)
      scoredMembers.sort((a, b) => b.score - a.score);

      return scoredMembers;
    } catch (error) {
      logger.error('Error suggesting assignees:', error);
      throw error;
    }
  }

  async calculateAssignmentScore(user, task) {
    let score = 0;

    try {
      // Factor 1: Workload (0-30 points)
      const currentTasks = await prisma.task.count({
        where: {
          assignedTo: user.id,
          status: { in: ['IN_PROGRESS', 'ASSIGNED', 'READY_TO_START'] }
        }
      });
      const workloadScore = Math.max(0, 30 - (currentTasks * 5));
      score += workloadScore;

      // Factor 2: Past performance (0-25 points)
      const completedTasks = await prisma.task.count({
        where: {
          assignedTo: user.id,
          status: 'COMPLETED',
          projectId: task.projectId
        }
      });
      score += Math.min(25, completedTasks * 5);

      // Factor 3: Availability (0-20 points)
      const availability = await this.checkUserAvailability(user.id, task.startDate, task.endDate);
      if (availability.available) {
        score += 20;
      } else {
        score += Math.max(0, 20 - (availability.currentTaskCount * 5));
      }

      // Factor 4: User status (0-15 points)
      if (user.status === 'ACTIVE') {
        score += 15;
      }

      // Factor 5: Similar task experience (0-10 points)
      const similarTasks = await prisma.task.count({
        where: {
          assignedTo: user.id,
          taskType: task.taskType,
          status: 'COMPLETED'
        }
      });
      score += Math.min(10, similarTasks * 2);

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      logger.error('Error calculating assignment score:', error);
      return 50; // Default score
    }
  }

  getRecommendationReason(score) {
    if (score >= 80) return 'Highly recommended - Low workload, good track record';
    if (score >= 60) return 'Recommended - Available with relevant experience';
    if (score >= 40) return 'Suitable - May need support';
    return 'Available but high workload';
  }

  // ============================================
  // TASK DEPENDENCIES
  // ============================================

  async addDependency(taskId, dependsOnTaskId, dependencyType = 'FINISH_TO_START', lagDays = 0) {
    try {
      // Check for circular dependencies
      const wouldCreateCycle = await this.checkCircularDependency(taskId, dependsOnTaskId);
      if (wouldCreateCycle) {
        throw new Error('Circular dependency detected: This would create an infinite loop');
      }

      const dependency = await prisma.taskDependency.create({
        data: {
          taskId,
          dependsOnTaskId,
          dependencyType,
          lagDays
        },
        include: {
          task: { select: { id: true, name: true } },
          dependsOnTask: { select: { id: true, name: true, status: true } }
        }
      });

      // Recalculate task dates based on dependency
      await this.recalculateTaskDates(taskId);

      logger.info(`Dependency added: Task ${taskId} depends on ${dependsOnTaskId}`);
      return dependency;
    } catch (error) {
      logger.error('Error adding dependency:', error);
      throw error;
    }
  }

  async checkCircularDependency(fromTaskId, toTaskId) {
    try {
      // Build dependency graph using DFS
      const visited = new Set();
      const recursionStack = new Set();

      const hasCycle = async (currentTaskId) => {
        if (recursionStack.has(currentTaskId)) {
          return true; // Cycle detected
        }

        if (visited.has(currentTaskId)) {
          return false;
        }

        visited.add(currentTaskId);
        recursionStack.add(currentTaskId);

        // Get all tasks that depend on current task
        const dependents = await prisma.taskDependency.findMany({
          where: { dependsOnTaskId: currentTaskId },
          select: { taskId: true }
        });

        for (const dep of dependents) {
          if (await hasCycle(dep.taskId)) {
            return true;
          }
        }

        recursionStack.delete(currentTaskId);
        return false;
      };

      // Check if adding this dependency would create a cycle
      // Simulate adding the edge
      return await hasCycle(toTaskId);
    } catch (error) {
      logger.error('Error checking circular dependency:', error);
      return false;
    }
  }

  async recalculateTaskDates(taskId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          dependencies: {
            include: {
              dependsOnTask: true
            }
          }
        }
      });

      // Calculate earliest start date based on dependencies
      let earliestStart = task.startDate;

      for (const dep of task.dependencies) {
        const predecessor = dep.dependsOnTask;
        let requiredStartDate;

        switch (dep.dependencyType) {
          case 'FINISH_TO_START':
            requiredStartDate = new Date(predecessor.endDate);
            requiredStartDate.setDate(requiredStartDate.getDate() + dep.lagDays + 1);
            break;
          case 'START_TO_START':
            requiredStartDate = new Date(predecessor.startDate);
            requiredStartDate.setDate(requiredStartDate.getDate() + dep.lagDays);
            break;
          case 'FINISH_TO_FINISH':
            requiredStartDate = new Date(predecessor.endDate);
            requiredStartDate.setDate(requiredStartDate.getDate() - task.duration + dep.lagDays);
            break;
          default:
            requiredStartDate = task.startDate;
        }

        if (requiredStartDate > earliestStart) {
          earliestStart = requiredStartDate;
        }
      }

      // Update task dates if changed
      if (earliestStart > task.startDate) {
        const newEndDate = new Date(earliestStart);
        newEndDate.setDate(newEndDate.getDate() + task.duration);

        await prisma.task.update({
          where: { id: taskId },
          data: {
            startDate: earliestStart,
            endDate: newEndDate
          }
        });

        logger.info(`Task ${taskId} dates recalculated: ${earliestStart} to ${newEndDate}`);
      }
    } catch (error) {
      logger.error('Error recalculating task dates:', error);
    }
  }

  // ============================================
  // TASK CHECKLISTS
  // ============================================

  async createChecklists(taskId, checklistItems) {
    try {
      const checklists = await prisma.taskChecklist.createMany({
        data: checklistItems.map((item, index) => ({
          taskId,
          item: item.item,
          sortOrder: item.sortOrder || index,
          mandatory: item.mandatory || false
        }))
      });

      return checklists;
    } catch (error) {
      logger.error('Error creating checklists:', error);
      throw error;
    }
  }

  async updateChecklistItem(checklistId, completed, userId) {
    try {
      const checklist = await prisma.taskChecklist.update({
        where: { id: checklistId },
        data: {
          completed,
          completedBy: completed ? userId : null,
          completedAt: completed ? new Date() : null
        }
      });

      return checklist;
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      throw error;
    }
  }

  // ============================================
  // TASK ALERTS
  // ============================================

  async createAlert(taskId, type, severity, message, details = null) {
    try {
      const alert = await prisma.taskAlert.create({
        data: {
          taskId,
          type,
          severity,
          message,
          details
        }
      });

      // Get task assignee and PM
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: { select: { createdBy: true } },
          assignee: { select: { id: true } }
        }
      });

      // Send notifications
      const notifyUsers = [task.project.createdBy];
      if (task.assignee) {
        notifyUsers.push(task.assignee.id);
      }

      for (const userId of notifyUsers) {
        await notificationService.send({
          userId,
          type: `task_alert_${type}`,
          title: 'Task Alert',
          message,
          actionUrl: `/tasks/${taskId}`,
          priority: severity === 'CRITICAL' || severity === 'URGENT' ? 'urgent' : 'high'
        });
      }

      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  // ============================================
  // TASK MATERIALS
  // ============================================

  async linkMaterials(taskId, materials) {
    try {
      const taskMaterials = await Promise.all(
        materials.map(async (material) => {
          return await prisma.taskMaterial.create({
            data: {
              taskId,
              materialId: material.materialId,
              materialName: material.materialName,
              category: material.category,
              estimatedQuantity: material.estimatedQuantity,
              unit: material.unit,
              estimatedUnitRate: material.estimatedUnitRate,
              estimatedTotal: material.estimatedQuantity * material.estimatedUnitRate,
              requiredByDate: material.requiredByDate,
              inventoryAvailable: material.inventoryAvailable || false
            }
          });
        })
      );

      logger.info(`${materials.length} materials linked to task ${taskId}`);
      return taskMaterials;
    } catch (error) {
      logger.error('Error linking materials:', error);
      throw error;
    }
  }
}

module.exports = new TaskManagementService();
