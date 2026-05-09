const reportService = require('../services/report.service');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Generate project PDF report
 */
exports.generateProjectPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportService.generateProjectPDFReport(id);

    res.json({
      success: true,
      message: 'PDF report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Generate project PDF error:', error);
    next(error);
  }
};

/**
 * Generate daily report PDF
 */
exports.generateDailyReportPDF = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportService.generateDailyReportPDF(id);

    res.json({
      success: true,
      message: 'Daily report PDF generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Generate daily report PDF error:', error);
    next(error);
  }
};

/**
 * Export project to Excel
 */
exports.exportProjectToExcel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportService.exportProjectToExcel(id);

    res.json({
      success: true,
      message: 'Project exported to Excel successfully',
      data: report
    });
  } catch (error) {
    logger.error('Export to Excel error:', error);
    next(error);
  }
};

/**
 * Generate monthly summary
 */
exports.generateMonthlySummary = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const summary = await reportService.generateMonthlySummary(
      projectId,
      parseInt(month),
      parseInt(year)
    );

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    logger.error('Generate monthly summary error:', error);
    next(error);
  }
};

/**
 * Get all daily reports for a project
 */
exports.getDailyReports = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = { projectId };

    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        include: {
          submitter: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          images: true
        },
        orderBy: { reportDate: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.dailyReport.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get daily reports error:', error);
    next(error);
  }
};

/**
 * Create daily report
 */
exports.createDailyReport = async (req, res, next) => {
  try {
    const {
      projectId,
      reportDate,
      weather,
      temperature,
      workersPresent,
      workersAbsent,
      workSummary,
      challengesFaced,
      materialsConsumed,
      equipmentUsed,
      safetyIncidents,
      visitors
    } = req.body;

    const report = await prisma.dailyReport.create({
      data: {
        projectId,
        reportDate: new Date(reportDate),
        weather,
        temperature,
        workersPresent: workersPresent || 0,
        workersAbsent: workersAbsent || 0,
        workSummary,
        challengesFaced,
        materialsConsumed,
        equipmentUsed,
        safetyIncidents,
        visitors,
        submittedBy: req.user.id
      },
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info(`Daily report created for project ${projectId} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Daily report created successfully',
      data: { report }
    });
  } catch (error) {
    logger.error('Create daily report error:', error);
    next(error);
  }
};

/**
 * Update daily report
 */
exports.updateDailyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.reportDate) {
      updateData.reportDate = new Date(updateData.reportDate);
    }

    const report = await prisma.dailyReport.update({
      where: { id },
      data: updateData,
      include: {
        submitter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Daily report updated successfully',
      data: { report }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found'
      });
    }
    logger.error('Update daily report error:', error);
    next(error);
  }
};

/**
 * Delete daily report
 */
exports.deleteDailyReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.dailyReport.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Daily report deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found'
      });
    }
    logger.error('Delete daily report error:', error);
    next(error);
  }
};

/**
 * Get site issues
 */
exports.getSiteIssues = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, severity } = req.query;

    const where = { projectId };

    if (status) where.status = status;
    if (severity) where.severity = severity;

    const issues = await prisma.siteIssue.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { issues }
    });
  } catch (error) {
    logger.error('Get site issues error:', error);
    next(error);
  }
};

/**
 * Create site issue
 */
exports.createSiteIssue = async (req, res, next) => {
  try {
    const {
      projectId,
      taskId,
      issueType,
      title,
      description,
      severity
    } = req.body;

    const issue = await prisma.siteIssue.create({
      data: {
        projectId,
        taskId,
        issueType,
        title,
        description,
        severity: severity || 'MEDIUM',
        reportedBy: req.user.id,
        status: 'OPEN'
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Send notifications for critical issues
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      try {
        const notificationService = require('../services/notification.service');
        const project = await prisma.project.findUnique({
          where: { id: projectId }
        });

        await notificationService.notifySafetyViolation(issue, project);
      } catch (notifError) {
        // Log but don't fail the request if notification fails
        logger.warn('Failed to send notification:', notifError);
      }
    }

    logger.info(`Site issue created: ${title} for project ${projectId}`);

    res.status(201).json({
      success: true,
      message: 'Site issue reported successfully',
      data: { issue }
    });
  } catch (error) {
    logger.error('Create site issue error:', error);
    next(error);
  }
};

/**
 * Update site issue status
 */
exports.updateSiteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const issue = await prisma.siteIssue.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      message: 'Site issue updated successfully',
      data: { issue }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Site issue not found'
      });
    }
    logger.error('Update site issue error:', error);
    next(error);
  }
};

/**
 * Download report file
 */
exports.downloadReport = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../reports', filename);

    res.download(filePath);
  } catch (error) {
    logger.error('Download report error:', error);
    next(error);
  }
};
