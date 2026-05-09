const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/progress.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

// ============================================
// DAILY PROGRESS REPORTS
// ============================================

// Submit daily report
router.post(
  '/tasks/:taskId/daily-reports',
  authenticate,
  progressController.submitDailyReport
);

// Get daily report by ID
router.get(
  '/reports/:reportId',
  authenticate,
  progressController.getDailyReport
);

// Get task reports
router.get(
  '/tasks/:taskId/reports',
  authenticate,
  progressController.getTaskReports
);

// Get project reports
router.get(
  '/projects/:projectId/reports',
  authenticate,
  progressController.getProjectReports
);

// ============================================
// REPORT REVIEW
// ============================================

// Review report
router.post(
  '/reports/:reportId/review',
  authenticate,
  authorize('report:review'),
  progressController.reviewReport
);

// Get pending reviews
router.get(
  '/reviews/pending',
  authenticate,
  authorize('report:review'),
  progressController.getPendingReviews
);

// ============================================
// ANALYTICS
// ============================================

// Get task progress analytics
router.get(
  '/tasks/:taskId/analytics',
  authenticate,
  progressController.getProgressAnalytics
);

// Get project progress summary
router.get(
  '/projects/:projectId/progress-summary',
  authenticate,
  progressController.getProjectProgressSummary
);

module.exports = router;
