const progressService = require('../services/progress.service');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

class ProgressController {

  // ============================================
  // DAILY PROGRESS REPORTS
  // ============================================

  async submitDailyReport(req, res, next) {
    try {
      const { taskId } = req.params;

      const reportData = {
        taskId,
        projectId: req.body.projectId,
        reportDate: new Date(req.body.reportDate),
        siteId: req.body.siteId,

        // Time tracking
        workStartTime: req.body.workStartTime,
        workEndTime: req.body.workEndTime,
        totalHours: req.body.totalHours,
        breakTimeHours: req.body.breakTimeHours || 0,
        productiveHours: req.body.productiveHours,

        // Progress
        progressToday: req.body.progressToday,
        cumulativeProgress: req.body.cumulativeProgress,
        previousProgress: req.body.previousProgress || 0,
        progressDescription: req.body.progressDescription,

        // Work details
        workCompleted: req.body.workCompleted,
        workInProgress: req.body.workInProgress,
        workPending: req.body.workPending,

        // Resources
        laborAttendance: req.body.laborAttendance,
        totalLaborCount: req.body.totalLaborCount || 0,
        equipmentUsage: req.body.equipmentUsage,
        materialsConsumed: req.body.materialsConsumed,

        // Quality & Safety
        qualityChecks: req.body.qualityChecks,
        safetyObservations: req.body.safetyObservations,
        safetyIncidents: req.body.safetyIncidents,

        // Issues & Delays
        issues: req.body.issues,
        delays: req.body.delays,
        totalDelayHours: req.body.totalDelayHours || 0,

        // Weather
        weatherConditions: req.body.weatherConditions,

        // Photos
        photos: req.body.photos,

        // Remarks
        engineerRemarks: req.body.engineerRemarks,

        // Geolocation
        submissionLatitude: req.body.latitude,
        submissionLongitude: req.body.longitude,
        locationVerified: req.body.locationVerified || false
      };

      const report = await progressService.submitDailyReport(reportData, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Daily report submitted successfully',
        data: report
      });
    } catch (error) {
      logger.error('Error submitting daily report:', error);
      next(error);
    }
  }

  async getDailyReport(req, res, next) {
    try {
      const { reportId } = req.params;

      const report = await progressService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Error fetching daily report:', error);
      next(error);
    }
  }

  async getTaskReports(req, res, next) {
    try {
      const { taskId } = req.params;
      const { limit = 10, page = 1 } = req.query;

      const reports = await prisma.dailyProgressReport.findMany({
        where: { taskId },
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      const total = await prisma.dailyProgressReport.count({
        where: { taskId }
      });

      res.json({
        success: true,
        data: reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching task reports:', error);
      next(error);
    }
  }

  async getProjectReports(req, res, next) {
    try {
      const { projectId } = req.params;
      const {
        startDate,
        endDate,
        siteId,
        reviewStatus,
        page = 1,
        limit = 20
      } = req.query;

      const where = {
        projectId
      };

      if (startDate && endDate) {
        where.reportDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      if (siteId) {
        where.siteId = siteId;
      }

      if (reviewStatus) {
        where.reviewStatus = reviewStatus;
      }

      const reports = await prisma.dailyProgressReport.findMany({
        where,
        include: {
          task: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      const total = await prisma.dailyProgressReport.count({ where });

      res.json({
        success: true,
        data: reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching project reports:', error);
      next(error);
    }
  }

  // ============================================
  // REPORT REVIEW
  // ============================================

  async reviewReport(req, res, next) {
    try {
      const { reportId } = req.params;
      const { action, comments } = req.body;

      if (!['APPROVED', 'REJECTED', 'REVISION_REQUIRED'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be APPROVED, REJECTED, or REVISION_REQUIRED'
        });
      }

      if ((action === 'REJECTED' || action === 'REVISION_REQUIRED') && !comments) {
        return res.status(400).json({
          success: false,
          message: 'Comments are required for rejection or revision request'
        });
      }

      const report = await progressService.reviewReport(
        reportId,
        req.user.id,
        action,
        comments
      );

      res.json({
        success: true,
        message: `Report ${action.toLowerCase()}`,
        data: report
      });
    } catch (error) {
      logger.error('Error reviewing report:', error);
      next(error);
    }
  }

  async getPendingReviews(req, res, next) {
    try {
      // Get projects where user is PM or has review rights
      const userProjects = await prisma.projectMember.findMany({
        where: {
          userId: req.user.id,
          role: { in: ['project_manager', 'supervisor', 'site_engineer'] }
        },
        select: { projectId: true }
      });

      const projectIds = userProjects.map(p => p.projectId);

      const pendingReports = await prisma.dailyProgressReport.findMany({
        where: {
          projectId: { in: projectIds },
          reviewStatus: 'PENDING'
        },
        include: {
          task: {
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
        },
        orderBy: { reportDate: 'desc' }
      });

      res.json({
        success: true,
        data: pendingReports
      });
    } catch (error) {
      logger.error('Error fetching pending reviews:', error);
      next(error);
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getProgressAnalytics(req, res, next) {
    try {
      const { taskId } = req.params;

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          estimatedCost: true,
          actualCost: true,
          progress: true,
          status: true
        }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const reports = await prisma.dailyProgressReport.findMany({
        where: { taskId },
        orderBy: { reportDate: 'asc' }
      });

      // Calculate analytics
      const analytics = {
        task,
        totalReports: reports.length,
        totalCost: reports.reduce((sum, r) => sum + Number(r.dailyCost), 0),
        totalDelayHours: reports.reduce((sum, r) => sum + Number(r.totalDelayHours), 0),
        totalLaborDays: reports.reduce((sum, r) => sum + Number(r.totalLaborCount), 0),
        averageProgressPerDay: reports.length > 0
          ? reports.reduce((sum, r) => sum + Number(r.progressToday), 0) / reports.length
          : 0,
        progressTrend: reports.map(r => ({
          date: r.reportDate,
          progress: Number(r.cumulativeProgress),
          cost: Number(r.dailyCost)
        })),
        costBreakdown: {
          labor: reports.reduce((sum, r) => sum + Number(r.totalLaborCost), 0),
          equipment: reports.reduce((sum, r) => sum + Number(r.totalEquipmentCost), 0),
          material: reports.reduce((sum, r) => sum + Number(r.totalMaterialCost), 0)
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error fetching progress analytics:', error);
      next(error);
    }
  }

  async getProjectProgressSummary(req, res, next) {
    try {
      const { projectId } = req.params;

      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          estimatedCost: true,
          actualCost: true,
          isCriticalPath: true
        }
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
      const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const delayedTasks = tasks.filter(t => t.status === 'DELAYED').length;

      const totalEstimatedCost = tasks.reduce((sum, t) => sum + Number(t.estimatedCost), 0);
      const totalActualCost = tasks.reduce((sum, t) => sum + Number(t.actualCost), 0);

      const weightedProgress = totalEstimatedCost > 0
        ? tasks.reduce((sum, t) => {
            const weight = Number(t.estimatedCost) / totalEstimatedCost;
            return sum + (Number(t.progress) * weight);
          }, 0)
        : 0;

      const summary = {
        projectId,
        totalTasks,
        completedTasks,
        inProgressTasks,
        delayedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        overallProgress: weightedProgress,
        budgetStatus: {
          estimated: totalEstimatedCost,
          actual: totalActualCost,
          variance: totalActualCost - totalEstimatedCost,
          variancePercent: totalEstimatedCost > 0
            ? ((totalActualCost - totalEstimatedCost) / totalEstimatedCost) * 100
            : 0
        },
        criticalPathTasks: tasks.filter(t => t.isCriticalPath).length
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error('Error fetching project progress summary:', error);
      next(error);
    }
  }
}

module.exports = new ProgressController();
