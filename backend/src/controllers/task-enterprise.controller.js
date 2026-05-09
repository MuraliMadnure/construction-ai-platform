const taskService = require('../services/task.service');
const approvalService = require('../services/approval.service');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

class TaskEnterpriseController {

  // ============================================
  // PHASE MANAGEMENT
  // ============================================

  async createPhase(req, res, next) {
    try {
      const { projectId } = req.params;
      const phase = await taskService.createPhase(projectId, req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Phase created successfully',
        data: phase
      });
    } catch (error) {
      logger.error('Error creating phase:', error);
      next(error);
    }
  }

  async createSubphase(req, res, next) {
    try {
      const { phaseId } = req.params;
      const subphase = await taskService.createSubphase(phaseId, req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Subphase created successfully',
        data: subphase
      });
    } catch (error) {
      logger.error('Error creating subphase:', error);
      next(error);
    }
  }

  async getProjectPhases(req, res, next) {
    try {
      const { projectId } = req.params;
      const phases = await taskService.getProjectPhases(projectId);

      res.json({
        success: true,
        data: phases
      });
    } catch (error) {
      logger.error('Error fetching phases:', error);
      next(error);
    }
  }

  // ============================================
  // SMART ASSIGNMENT
  // ============================================

  async assignTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const { userId, instructions, acceptanceRequired, allocationPercent } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const assignment = await taskService.assignTask(
        taskId,
        userId,
        req.user.id,
        {
          instructions,
          acceptanceRequired: acceptanceRequired || false,
          allocationPercent: allocationPercent || 100
        }
      );

      res.json({
        success: true,
        message: 'Task assigned successfully',
        data: assignment
      });
    } catch (error) {
      logger.error('Error assigning task:', error);
      next(error);
    }
  }

  async acceptAssignment(req, res, next) {
    try {
      const { taskId } = req.params;
      const { comments } = req.body;

      const assignment = await taskService.acceptTaskAssignment(
        taskId,
        req.user.id,
        comments
      );

      res.json({
        success: true,
        message: 'Task assignment accepted',
        data: assignment
      });
    } catch (error) {
      logger.error('Error accepting assignment:', error);
      next(error);
    }
  }

  async declineAssignment(req, res, next) {
    try {
      const { taskId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Decline reason is required'
        });
      }

      const result = await taskService.declineTaskAssignment(
        taskId,
        req.user.id,
        reason
      );

      res.json({
        success: true,
        message: 'Task assignment declined',
        data: result
      });
    } catch (error) {
      logger.error('Error declining assignment:', error);
      next(error);
    }
  }

  async getAssigneeSuggestions(req, res, next) {
    try {
      const { taskId } = req.params;
      const suggestions = await taskService.suggestAssignees(taskId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Error getting assignee suggestions:', error);
      next(error);
    }
  }

  // ============================================
  // DEPENDENCIES
  // ============================================

  async addDependency(req, res, next) {
    try {
      const { taskId } = req.params;
      const { dependsOnTaskId, dependencyType = 'FINISH_TO_START', lagDays = 0 } = req.body;

      if (!dependsOnTaskId) {
        return res.status(400).json({
          success: false,
          message: 'dependsOnTaskId is required'
        });
      }

      const dependency = await taskService.addDependency(
        taskId,
        dependsOnTaskId,
        dependencyType,
        parseInt(lagDays)
      );

      res.status(201).json({
        success: true,
        message: 'Dependency added successfully',
        data: dependency
      });
    } catch (error) {
      logger.error('Error adding dependency:', error);
      next(error);
    }
  }

  async removeDependency(req, res, next) {
    try {
      const { dependencyId } = req.params;

      await prisma.taskDependency.delete({
        where: { id: dependencyId }
      });

      res.json({
        success: true,
        message: 'Dependency removed successfully'
      });
    } catch (error) {
      logger.error('Error removing dependency:', error);
      next(error);
    }
  }

  async getTaskDependencies(req, res, next) {
    try {
      const { taskId } = req.params;

      const dependencies = await prisma.taskDependency.findMany({
        where: {
          OR: [
            { taskId },
            { dependsOnTaskId: taskId }
          ]
        },
        include: {
          task: { select: { id: true, name: true, status: true, progress: true } },
          dependsOnTask: { select: { id: true, name: true, status: true, progress: true } }
        }
      });

      res.json({
        success: true,
        data: dependencies
      });
    } catch (error) {
      logger.error('Error fetching dependencies:', error);
      next(error);
    }
  }

  // ============================================
  // CHECKLISTS
  // ============================================

  async addChecklist(req, res, next) {
    try {
      const { taskId } = req.params;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Checklist items array is required'
        });
      }

      const checklists = await taskService.createChecklists(taskId, items);

      res.status(201).json({
        success: true,
        message: 'Checklist items added',
        data: checklists
      });
    } catch (error) {
      logger.error('Error adding checklist:', error);
      next(error);
    }
  }

  async updateChecklistItem(req, res, next) {
    try {
      const { checklistId } = req.params;
      const { completed } = req.body;

      if (typeof completed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'completed must be a boolean'
        });
      }

      const checklist = await taskService.updateChecklistItem(
        checklistId,
        completed,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Checklist item updated',
        data: checklist
      });
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      next(error);
    }
  }

  async getTaskChecklists(req, res, next) {
    try {
      const { taskId } = req.params;

      const checklists = await prisma.taskChecklist.findMany({
        where: { taskId },
        orderBy: { sortOrder: 'asc' }
      });

      res.json({
        success: true,
        data: checklists
      });
    } catch (error) {
      logger.error('Error fetching checklists:', error);
      next(error);
    }
  }

  // ============================================
  // MATERIALS
  // ============================================

  async linkMaterials(req, res, next) {
    try {
      const { taskId } = req.params;
      const { materials } = req.body;

      if (!Array.isArray(materials) || materials.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Materials array is required'
        });
      }

      const taskMaterials = await taskService.linkMaterials(taskId, materials);

      res.status(201).json({
        success: true,
        message: 'Materials linked successfully',
        data: taskMaterials
      });
    } catch (error) {
      logger.error('Error linking materials:', error);
      next(error);
    }
  }

  async getTaskMaterials(req, res, next) {
    try {
      const { taskId } = req.params;

      const materials = await prisma.taskMaterial.findMany({
        where: { taskId },
        orderBy: { category: 'asc' }
      });

      // Calculate material readiness
      const readiness = {
        total: materials.length,
        reserved: materials.filter(m => m.reservationStatus === 'RESERVED').length,
        pending: materials.filter(m => m.reservationStatus === 'PENDING').length,
        partial: materials.filter(m => m.reservationStatus === 'PARTIAL').length
      };

      res.json({
        success: true,
        data: materials,
        readiness
      });
    } catch (error) {
      logger.error('Error fetching task materials:', error);
      next(error);
    }
  }

  // ============================================
  // COMMENTS
  // ============================================

  async addComment(req, res, next) {
    try {
      const { taskId } = req.params;
      const { comment, parentId, attachments } = req.body;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required'
        });
      }

      const taskComment = await prisma.taskComment.create({
        data: {
          taskId,
          userId: req.user.id,
          comment: comment.trim(),
          parentId,
          attachments: attachments ? JSON.stringify(attachments) : null
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Comment added',
        data: taskComment
      });
    } catch (error) {
      logger.error('Error adding comment:', error);
      next(error);
    }
  }

  async getTaskComments(req, res, next) {
    try {
      const { taskId } = req.params;

      const comments = await prisma.taskComment.findMany({
        where: {
          taskId,
          deletedAt: null
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      logger.error('Error fetching comments:', error);
      next(error);
    }
  }

  // ============================================
  // ALERTS
  // ============================================

  async getTaskAlerts(req, res, next) {
    try {
      const { taskId } = req.params;

      const alerts = await prisma.taskAlert.findMany({
        where: {
          taskId,
          dismissedAt: null
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      next(error);
    }
  }

  async dismissAlert(req, res, next) {
    try {
      const { alertId } = req.params;

      await prisma.taskAlert.update({
        where: { id: alertId },
        data: { dismissedAt: new Date() }
      });

      res.json({
        success: true,
        message: 'Alert dismissed'
      });
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      next(error);
    }
  }

  // ============================================
  // GANTT DATA
  // ============================================

  async getGanttData(req, res, next) {
    try {
      const { projectId } = req.params;

      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          deletedAt: null
        },
        include: {
          dependencies: {
            include: {
              dependsOnTask: { select: { id: true } }
            }
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          phase: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { startDate: 'asc' }
      });

      // Transform to Gantt-friendly format (dhtmlx-gantt or Syncfusion)
      const ganttData = {
        data: tasks.map(task => ({
          id: task.id,
          text: task.name,
          start_date: task.startDate.toISOString().split('T')[0],
          end_date: task.endDate.toISOString().split('T')[0],
          duration: task.duration,
          progress: Number(task.progress) / 100,
          parent: task.parentTaskId || task.phaseId || '0',
          priority: task.priority,
          status: task.status,
          assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : null,
          critical: task.isCriticalPath,
          risk_level: task.riskLevel,
          actual_start: task.actualStartDate?.toISOString().split('T')[0],
          actual_end: task.actualEndDate?.toISOString().split('T')[0]
        })),
        links: []
      };

      // Add dependencies as links
      tasks.forEach(task => {
        task.dependencies.forEach(dep => {
          ganttData.links.push({
            id: dep.id,
            source: dep.dependsOnTaskId,
            target: task.id,
            type: this.mapDependencyType(dep.dependencyType),
            lag: dep.lagDays
          });
        });
      });

      res.json({
        success: true,
        data: ganttData
      });
    } catch (error) {
      logger.error('Error fetching Gantt data:', error);
      next(error);
    }
  }

  mapDependencyType(type) {
    const mapping = {
      'FINISH_TO_START': '0',
      'START_TO_START': '1',
      'FINISH_TO_FINISH': '2',
      'START_TO_FINISH': '3'
    };
    return mapping[type] || '0';
  }

  // ============================================
  // TASK RESOURCES
  // ============================================

  async getTaskResources(req, res, next) {
    try {
      const { taskId } = req.params;

      const resources = await prisma.taskResource.findMany({
        where: { taskId },
        orderBy: { resourceType: 'asc' }
      });

      res.json({
        success: true,
        data: resources
      });
    } catch (error) {
      logger.error('Error fetching task resources:', error);
      next(error);
    }
  }

  // ============================================
  // COST ENTRIES
  // ============================================

  async getCostEntries(req, res, next) {
    try {
      const { taskId } = req.params;

      const entries = await prisma.taskCostEntry.findMany({
        where: { taskId },
        orderBy: { date: 'desc' }
      });

      const summary = {
        labor: entries.filter(e => e.type === 'labor').reduce((sum, e) => sum + Number(e.amount), 0),
        equipment: entries.filter(e => e.type === 'equipment').reduce((sum, e) => sum + Number(e.amount), 0),
        material: entries.filter(e => e.type === 'material').reduce((sum, e) => sum + Number(e.amount), 0),
        overhead: entries.filter(e => e.type === 'overhead').reduce((sum, e) => sum + Number(e.amount), 0)
      };

      summary.total = summary.labor + summary.equipment + summary.material + summary.overhead;

      res.json({
        success: true,
        data: entries,
        summary
      });
    } catch (error) {
      logger.error('Error fetching cost entries:', error);
      next(error);
    }
  }
}

module.exports = new TaskEnterpriseController();
