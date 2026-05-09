const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');
const aiService = require('./ai.service');

class ProgressUpdateService {

  // ============================================
  // DAILY PROGRESS REPORT SUBMISSION
  // ============================================

  async submitDailyReport(reportData, userId) {
    try {
      // Validate report data
      this.validateReport(reportData);

      // Calculate totals
      const calculations = this.calculateTotals(reportData);

      // Create report
      const report = await prisma.dailyProgressReport.create({
        data: {
          ...reportData,
          ...calculations,
          reportedBy: userId,
          submittedAt: new Date(),
          submissionStatus: 'submitted'
        }
      });

      // Update task progress
      await this.updateTaskProgress(reportData.taskId, calculations);

      // Check for delays and create alerts
      await this.analyzeDelays(report);

      // Notify supervisor for review
      await this.notifySupervisorForReview(report.id, reportData.taskId);

      // Generate AI insights (async)
      this.generateAIInsights(report.id).catch(err =>
        logger.error('Error generating AI insights:', err)
      );

      logger.info(`Daily report submitted for task ${reportData.taskId}`);
      return report;
    } catch (error) {
      logger.error('Error submitting daily report:', error);
      throw error;
    }
  }

  validateReport(reportData) {
    if (!reportData.taskId) {
      throw new Error('Task ID is required');
    }
    if (!reportData.reportDate) {
      throw new Error('Report date is required');
    }
    if (reportData.cumulativeProgress < 0 || reportData.cumulativeProgress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
  }

  calculateTotals(reportData) {
    // Calculate total labor cost
    const totalLaborCost = reportData.laborAttendance?.reduce((sum, labor) => {
      return sum + (labor.count || 0) * (labor.wage_rate || 0) * (labor.hours_worked || 8);
    }, 0) || 0;

    // Calculate total equipment cost
    const totalEquipmentCost = reportData.equipmentUsage?.reduce((sum, equipment) => {
      return sum + ((equipment.hours_used || 0) * (equipment.hourly_rate || 0));
    }, 0) || 0;

    // Calculate total material cost
    const totalMaterialCost = reportData.materialsConsumed?.reduce((sum, material) => {
      return sum + ((material.quantity || 0) * (material.rate || 0));
    }, 0) || 0;

    const dailyCost = totalLaborCost + totalEquipmentCost + totalMaterialCost;

    return {
      totalLaborCost,
      totalEquipmentCost,
      totalMaterialCost,
      dailyCost
    };
  }

  async updateTaskProgress(taskId, calculations) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          dailyProgressReports: {
            orderBy: { reportDate: 'desc' },
            take: 1
          }
        }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const latestReport = task.dailyProgressReports[0];
      const cumulativeProgress = latestReport?.cumulativeProgress || 0;

      // Update task
      await prisma.task.update({
        where: { id: taskId },
        data: {
          progress: cumulativeProgress,
          actualStartDate: task.actualStartDate || new Date(),
          actualCost: { increment: calculations.dailyCost },
          status: cumulativeProgress >= 100 ? 'COMPLETED' :
                  task.status === 'APPROVED' || task.status === 'ASSIGNED' ? 'IN_PROGRESS' : task.status
        }
      });

      // If task is 100% complete, notify PM
      if (cumulativeProgress >= 100) {
        const project = await prisma.project.findUnique({
          where: { id: task.projectId },
          select: { createdBy: true }
        });

        await notificationService.send({
          userId: project.createdBy,
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.name}" has been marked as 100% complete`,
          actionUrl: `/tasks/${taskId}`,
          priority: 'high'
        });
      }

      // Update parent phase/subphase progress
      await this.updateParentProgress(taskId);

      logger.info(`Task ${taskId} progress updated to ${cumulativeProgress}%`);
    } catch (error) {
      logger.error('Error updating task progress:', error);
      throw error;
    }
  }

  async updateParentProgress(taskId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { subphaseId: true, phaseId: true, projectId: true }
      });

      if (!task) return;

      // Update subphase progress
      if (task.subphaseId) {
        const tasks = await prisma.task.findMany({
          where: {
            subphaseId: task.subphaseId,
            deletedAt: null
          },
          select: { progress: true }
        });

        const avgProgress = tasks.reduce((sum, t) => sum + Number(t.progress), 0) / tasks.length;

        await prisma.subphase.update({
          where: { id: task.subphaseId },
          data: {
            progress: avgProgress,
            updatedAt: new Date()
          }
        });
      }

      // Update phase progress
      if (task.phaseId) {
        const tasks = await prisma.task.findMany({
          where: {
            phaseId: task.phaseId,
            deletedAt: null
          },
          select: { progress: true, estimatedCost: true }
        });

        // Weighted progress by cost
        const totalCost = tasks.reduce((sum, t) => sum + Number(t.estimatedCost), 0);
        const weightedProgress = tasks.reduce((sum, t) => {
          const weight = Number(t.estimatedCost) / totalCost;
          return sum + (Number(t.progress) * weight);
        }, 0);

        await prisma.phase.update({
          where: { id: task.phaseId },
          data: {
            progress: weightedProgress || 0,
            updatedAt: new Date()
          }
        });
      }

      // Update project overall progress
      const projectTasks = await prisma.task.findMany({
        where: {
          projectId: task.projectId,
          deletedAt: null
        },
        select: { progress: true, estimatedCost: true }
      });

      const totalProjectCost = projectTasks.reduce((sum, t) => sum + Number(t.estimatedCost), 0);
      const weightedProjectProgress = projectTasks.reduce((sum, t) => {
        const weight = totalProjectCost > 0 ? Number(t.estimatedCost) / totalProjectCost : 1 / projectTasks.length;
        return sum + (Number(t.progress) * weight);
      }, 0);

      await prisma.project.update({
        where: { id: task.projectId },
        data: {
          progress: weightedProjectProgress || 0,
          updatedAt: new Date()
        }
      });

      logger.info(`Parent progress updated for task ${taskId}`);
    } catch (error) {
      logger.error('Error updating parent progress:', error);
    }
  }

  async analyzeDelays(report) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: report.taskId },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          actualStartDate: true,
          estimatedCost: true,
          actualCost: true,
          isCriticalPath: true,
          project: { select: { createdBy: true } }
        }
      });

      if (!task) return;

      // Calculate expected progress
      const totalDuration = this.getDaysBetween(task.startDate, task.endDate);
      const daysElapsed = this.getDaysBetween(task.actualStartDate || task.startDate, report.reportDate);
      const expectedProgress = (daysElapsed / totalDuration) * 100;

      // Compare with actual progress
      const progressVariance = Number(report.cumulativeProgress) - expectedProgress;

      // Schedule delay alert
      if (progressVariance < -10) {
        await prisma.taskAlert.create({
          data: {
            taskId: task.id,
            type: 'schedule_delay',
            severity: progressVariance < -20 ? 'CRITICAL' : 'WARNING',
            message: `Task is ${Math.abs(progressVariance).toFixed(1)}% behind schedule`,
            details: {
              expected_progress: expectedProgress,
              actual_progress: Number(report.cumulativeProgress),
              variance: progressVariance,
              days_elapsed: daysElapsed,
              total_duration: totalDuration
            }
          }
        });

        // Notify PM
        await notificationService.send({
          userId: task.project.createdBy,
          type: 'schedule_delay_alert',
          title: 'Task Behind Schedule',
          message: `Task is ${Math.abs(progressVariance).toFixed(1)}% behind schedule`,
          actionUrl: `/tasks/${task.id}`,
          priority: progressVariance < -20 ? 'urgent' : 'high'
        });
      }

      // Budget overrun alert
      if (task.estimatedCost > 0) {
        const budgetUtilization = (Number(task.actualCost) / Number(task.estimatedCost)) * 100;
        const expectedBudgetUtilization = expectedProgress;

        if (budgetUtilization > expectedBudgetUtilization + 10) {
          await prisma.taskAlert.create({
            data: {
              taskId: task.id,
              type: 'budget_overrun',
              severity: budgetUtilization > 100 ? 'CRITICAL' : 'WARNING',
              message: `Budget consumption ahead of progress by ${(budgetUtilization - expectedBudgetUtilization).toFixed(1)}%`,
              details: {
                budget_utilization: budgetUtilization,
                progress: Number(report.cumulativeProgress),
                variance: budgetUtilization - Number(report.cumulativeProgress)
              }
            }
          });

          // Notify PM
          await notificationService.send({
            userId: task.project.createdBy,
            type: 'budget_overrun_alert',
            title: 'Budget Overrun Detected',
            message: `Task budget utilization is higher than progress`,
            actionUrl: `/tasks/${task.id}`,
            priority: 'high'
          });
        }
      }

      logger.info(`Delay analysis completed for task ${task.id}`);
    } catch (error) {
      logger.error('Error analyzing delays:', error);
    }
  }

  getDaysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async notifySupervisorForReview(reportId, taskId) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: { select: { createdBy: true } }
        }
      });

      if (!task) return;

      // Notify PM for review
      await notificationService.send({
        userId: task.project.createdBy,
        type: 'daily_report_review',
        title: 'Daily Report Pending Review',
        message: `New daily report submitted for task: ${task.name}`,
        actionUrl: `/tasks/${taskId}/reports/${reportId}`,
        priority: 'normal'
      });

      logger.info(`Supervisor notified for report ${reportId}`);
    } catch (error) {
      logger.error('Error notifying supervisor:', error);
    }
  }

  async generateAIInsights(reportId) {
    try {
      const report = await prisma.dailyProgressReport.findUnique({
        where: { id: reportId },
        include: {
          task: {
            select: {
              id: true,
              name: true,
              estimatedCost: true,
              actualCost: true
            }
          }
        }
      });

      if (!report) return;

      // Get historical reports
      const historicalReports = await prisma.dailyProgressReport.findMany({
        where: {
          taskId: report.taskId,
          reportDate: { lt: report.reportDate }
        },
        orderBy: { reportDate: 'desc' },
        take: 7
      });

      const aiPrompt = `
Analyze this construction task daily progress report and provide insights:

Task: ${report.task.name}
Today's Progress: ${report.progressToday}%
Cumulative Progress: ${report.cumulativeProgress}%

Today's Activities:
${report.progressDescription || 'No description provided'}

Issues Reported:
${JSON.stringify(report.issues) || 'None'}

Labor: ${report.totalLaborCount} workers
Equipment Cost: ₹${report.totalEquipmentCost}
Material Cost: ₹${report.totalMaterialCost}
Total Daily Cost: ₹${report.dailyCost}

Weather: ${JSON.stringify(report.weatherConditions) || 'Not recorded'}

Historical Trend (last 7 days):
${historicalReports.map(r => `${r.reportDate}: ${r.progressToday}% progress, ₹${r.dailyCost} cost`).join('\n')}

Provide:
1. Progress analysis (on-track / behind / ahead)
2. Productivity assessment
3. Risk identification
4. Recommendations for tomorrow
5. Estimated completion date
6. Cost efficiency analysis

Keep response concise and actionable.
`;

      const aiResponse = await aiService.generateCompletion({
        prompt: aiPrompt,
        maxTokens: 500
      });

      // Save AI insights
      await prisma.dailyProgressReport.update({
        where: { id: reportId },
        data: {
          aiInsights: aiResponse,
          aiGeneratedAt: new Date()
        }
      });

      // If AI detects high risk, create alert
      if (aiResponse.toLowerCase().includes('high risk') || aiResponse.toLowerCase().includes('critical')) {
        await prisma.taskAlert.create({
          data: {
            taskId: report.taskId,
            type: 'ai_risk_alert',
            severity: 'WARNING',
            message: 'AI detected potential risks in latest progress report',
            details: { ai_insights: aiResponse }
          }
        });
      }

      logger.info(`AI insights generated for report ${reportId}`);
    } catch (error) {
      logger.error('Error generating AI insights:', error);
    }
  }

  // ============================================
  // REPORT REVIEW
  // ============================================

  async reviewReport(reportId, reviewerId, action, comments) {
    try {
      if (!['APPROVED', 'REJECTED', 'REVISION_REQUIRED'].includes(action)) {
        throw new Error('Invalid review action');
      }

      const report = await prisma.dailyProgressReport.update({
        where: { id: reportId },
        data: {
          reviewStatus: action,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewComments: comments
        },
        include: {
          task: { select: { id: true, name: true } }
        }
      });

      // Notify reporter
      await notificationService.send({
        userId: report.reportedBy,
        type: 'report_reviewed',
        title: 'Daily Report Reviewed',
        message: `Your report for ${report.reportDate.toISOString().split('T')[0]} has been ${action.toLowerCase()}`,
        actionUrl: `/tasks/${report.taskId}/reports/${reportId}`,
        priority: action === 'REJECTED' ? 'high' : 'normal'
      });

      logger.info(`Report ${reportId} ${action} by ${reviewerId}`);
      return report;
    } catch (error) {
      logger.error('Error reviewing report:', error);
      throw error;
    }
  }

  // ============================================
  // QUERIES
  // ============================================

  async getTaskReports(taskId, limit = 10) {
    try {
      const reports = await prisma.dailyProgressReport.findMany({
        where: { taskId },
        orderBy: { reportDate: 'desc' },
        take: limit
      });

      return reports;
    } catch (error) {
      logger.error('Error fetching task reports:', error);
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      const report = await prisma.dailyProgressReport.findUnique({
        where: { id: reportId },
        include: {
          task: {
            select: {
              id: true,
              name: true,
              project: { select: { id: true, name: true } }
            }
          }
        }
      });

      return report;
    } catch (error) {
      logger.error('Error fetching report:', error);
      throw error;
    }
  }
}

module.exports = new ProgressUpdateService();
