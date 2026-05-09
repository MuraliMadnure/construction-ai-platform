const approvalService = require('../services/approval.service');
const logger = require('../utils/logger');

class ApprovalController {

  // ============================================
  // WORKFLOW MANAGEMENT
  // ============================================

  async initiateWorkflow(req, res, next) {
    try {
      const { taskId } = req.params;
      const { workflowType = 'task_creation' } = req.body;

      const workflow = await approvalService.initiateWorkflow(
        taskId,
        workflowType,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Approval workflow initiated',
        data: workflow
      });
    } catch (error) {
      logger.error('Error initiating workflow:', error);
      next(error);
    }
  }

  async getWorkflowDetails(req, res, next) {
    try {
      const { workflowId } = req.params;

      const workflow = await prisma.taskApprovalWorkflow.findUnique({
        where: { id: workflowId },
        include: {
          approvalSteps: {
            orderBy: { sequence: 'asc' }
          },
          tasks: {
            select: {
              id: true,
              name: true,
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Workflow not found'
        });
      }

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      logger.error('Error fetching workflow:', error);
      next(error);
    }
  }

  // ============================================
  // APPROVAL ACTIONS
  // ============================================

  async approve(req, res, next) {
    try {
      const { workflowId, sequence } = req.params;
      const { comments, attachments } = req.body;

      await approvalService.processApproval(
        workflowId,
        parseInt(sequence),
        req.user.id,
        'APPROVED',
        comments,
        attachments
      );

      res.json({
        success: true,
        message: 'Approval step completed'
      });
    } catch (error) {
      logger.error('Error processing approval:', error);
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { workflowId, sequence } = req.params;
      const { comments } = req.body;

      if (!comments || comments.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      await approvalService.processApproval(
        workflowId,
        parseInt(sequence),
        req.user.id,
        'REJECTED',
        comments.trim()
      );

      res.json({
        success: true,
        message: 'Approval rejected'
      });
    } catch (error) {
      logger.error('Error rejecting approval:', error);
      next(error);
    }
  }

  async requestRevision(req, res, next) {
    try {
      const { workflowId, sequence } = req.params;
      const { comments } = req.body;

      if (!comments || comments.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Revision comments are required'
        });
      }

      await approvalService.processApproval(
        workflowId,
        parseInt(sequence),
        req.user.id,
        'REVISION_REQUIRED',
        comments.trim()
      );

      res.json({
        success: true,
        message: 'Revision requested'
      });
    } catch (error) {
      logger.error('Error requesting revision:', error);
      next(error);
    }
  }

  async conditionalApproval(req, res, next) {
    try {
      const { workflowId, sequence } = req.params;
      const { comments, conditions } = req.body;

      if (!comments || comments.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comments are required for conditional approval'
        });
      }

      await approvalService.processApproval(
        workflowId,
        parseInt(sequence),
        req.user.id,
        'CONDITIONAL_APPROVAL',
        comments.trim(),
        { conditions }
      );

      res.json({
        success: true,
        message: 'Conditional approval granted'
      });
    } catch (error) {
      logger.error('Error processing conditional approval:', error);
      next(error);
    }
  }

  // ============================================
  // QUERIES
  // ============================================

  async getPendingApprovals(req, res, next) {
    try {
      const approvals = await approvalService.getPendingApprovals(req.user.id);

      res.json({
        success: true,
        data: approvals
      });
    } catch (error) {
      logger.error('Error fetching pending approvals:', error);
      next(error);
    }
  }

  async getMyApprovalHistory(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const where = {
        approverId: req.user.id
      };

      if (status) {
        where.status = status;
      }

      const approvals = await prisma.taskApprovalStep.findMany({
        where,
        include: {
          workflow: {
            include: {
              tasks: {
                select: {
                  id: true,
                  name: true,
                  project: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      const total = await prisma.taskApprovalStep.count({ where });

      res.json({
        success: true,
        data: approvals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching approval history:', error);
      next(error);
    }
  }

  // ============================================
  // SLA & ESCALATION
  // ============================================

  async checkEscalations(req, res, next) {
    try {
      // This would typically be triggered by a cron job
      // But can be manually triggered by admin
      await approvalService.checkEscalations();

      res.json({
        success: true,
        message: 'Escalation check completed'
      });
    } catch (error) {
      logger.error('Error checking escalations:', error);
      next(error);
    }
  }

  async getApprovalStats(req, res, next) {
    try {
      const userId = req.user.id;

      const stats = {
        pending: await prisma.taskApprovalStep.count({
          where: {
            approverId: userId,
            status: 'PENDING'
          }
        }),
        approved: await prisma.taskApprovalStep.count({
          where: {
            approverId: userId,
            status: 'APPROVED'
          }
        }),
        rejected: await prisma.taskApprovalStep.count({
          where: {
            approverId: userId,
            status: 'REJECTED'
          }
        }),
        overdue: await prisma.taskApprovalStep.count({
          where: {
            approverId: userId,
            status: 'PENDING',
            submittedAt: {
              lt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
            }
          }
        })
      };

      stats.total = stats.pending + stats.approved + stats.rejected;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching approval stats:', error);
      next(error);
    }
  }
}

module.exports = new ApprovalController();
