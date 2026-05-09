const express = require('express');
const router = express.Router();
const approvalController = require('../../controllers/approval.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

// ============================================
// WORKFLOW MANAGEMENT
// ============================================

// Initiate approval workflow
router.post(
  '/tasks/:taskId/initiate',
  authenticate,
  authorize('task:create'),
  approvalController.initiateWorkflow
);

// Get workflow details
router.get(
  '/workflows/:workflowId',
  authenticate,
  approvalController.getWorkflowDetails
);

// ============================================
// APPROVAL ACTIONS
// ============================================

// Approve step
router.post(
  '/workflows/:workflowId/steps/:sequence/approve',
  authenticate,
  approvalController.approve
);

// Reject step
router.post(
  '/workflows/:workflowId/steps/:sequence/reject',
  authenticate,
  approvalController.reject
);

// Request revision
router.post(
  '/workflows/:workflowId/steps/:sequence/revision',
  authenticate,
  approvalController.requestRevision
);

// Conditional approval
router.post(
  '/workflows/:workflowId/steps/:sequence/conditional',
  authenticate,
  approvalController.conditionalApproval
);

// ============================================
// QUERIES
// ============================================

// Get pending approvals for current user
router.get(
  '/pending',
  authenticate,
  approvalController.getPendingApprovals
);

// Get approval history
router.get(
  '/history',
  authenticate,
  approvalController.getMyApprovalHistory
);

// Get approval stats
router.get(
  '/stats',
  authenticate,
  approvalController.getApprovalStats
);

// ============================================
// ADMIN/SYSTEM
// ============================================

// Manually trigger escalation check (admin only)
router.post(
  '/escalations/check',
  authenticate,
  authorize('admin'),
  approvalController.checkEscalations
);

module.exports = router;
