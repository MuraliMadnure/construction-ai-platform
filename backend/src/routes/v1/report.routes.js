const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const reportController = require('../../controllers/report.controller');

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/projects/:id/pdf
 * @desc    Generate project PDF report
 * @access  Private
 */
router.get('/projects/:id/pdf', asyncHandler(reportController.generateProjectPDF));

/**
 * @route   GET /api/v1/reports/projects/:id/excel
 * @desc    Export project to Excel
 * @access  Private
 */
router.get('/projects/:id/excel', asyncHandler(reportController.exportProjectToExcel));

/**
 * @route   GET /api/v1/reports/projects/:projectId/monthly
 * @desc    Generate monthly summary
 * @access  Private
 */
router.get('/projects/:projectId/monthly', asyncHandler(reportController.generateMonthlySummary));

/**
 * @route   GET /api/v1/reports/projects/:projectId/daily
 * @desc    Get all daily reports for a project
 * @access  Private
 */
router.get('/projects/:projectId/daily', asyncHandler(reportController.getDailyReports));

/**
 * @route   POST /api/v1/reports/daily
 * @desc    Create daily report
 * @access  Private
 */
router.post('/daily', asyncHandler(reportController.createDailyReport));

/**
 * @route   GET /api/v1/reports/daily/:id/pdf
 * @desc    Generate daily report PDF
 * @access  Private
 */
router.get('/daily/:id/pdf', asyncHandler(reportController.generateDailyReportPDF));

/**
 * @route   PUT /api/v1/reports/daily/:id
 * @desc    Update daily report
 * @access  Private
 */
router.put('/daily/:id', asyncHandler(reportController.updateDailyReport));

/**
 * @route   DELETE /api/v1/reports/daily/:id
 * @desc    Delete daily report
 * @access  Private
 */
router.delete('/daily/:id', asyncHandler(reportController.deleteDailyReport));

/**
 * @route   GET /api/v1/reports/projects/:projectId/issues
 * @desc    Get site issues
 * @access  Private
 */
router.get('/projects/:projectId/issues', asyncHandler(reportController.getSiteIssues));

/**
 * @route   POST /api/v1/reports/issues
 * @desc    Create site issue
 * @access  Private
 */
router.post('/issues', asyncHandler(reportController.createSiteIssue));

/**
 * @route   PATCH /api/v1/reports/issues/:id
 * @desc    Update site issue status
 * @access  Private
 */
router.patch('/issues/:id', asyncHandler(reportController.updateSiteIssue));

/**
 * @route   GET /api/v1/reports/download/:filename
 * @desc    Download report file
 * @access  Private
 */
router.get('/download/:filename', asyncHandler(reportController.downloadReport));

module.exports = router;
