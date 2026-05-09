const express = require('express');
const router = express.Router();
const taskEnterpriseController = require('../../controllers/task-enterprise.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

// ============================================
// PHASE & SUBPHASE ROUTES
// ============================================

// Create phase
router.post(
  '/projects/:projectId/phases',
  authenticate,
  authorize('phase:create'),
  taskEnterpriseController.createPhase
);

// Get project phases
router.get(
  '/projects/:projectId/phases',
  authenticate,
  taskEnterpriseController.getProjectPhases
);

// Create subphase
router.post(
  '/phases/:phaseId/subphases',
  authenticate,
  authorize('phase:create'),
  taskEnterpriseController.createSubphase
);

// ============================================
// SMART ASSIGNMENT ROUTES
// ============================================

// Assign task
router.post(
  '/tasks/:taskId/assign',
  authenticate,
  authorize('task:assign'),
  taskEnterpriseController.assignTask
);

// Accept assignment
router.post(
  '/tasks/:taskId/accept',
  authenticate,
  taskEnterpriseController.acceptAssignment
);

// Decline assignment
router.post(
  '/tasks/:taskId/decline',
  authenticate,
  taskEnterpriseController.declineAssignment
);

// Get assignee suggestions
router.get(
  '/tasks/:taskId/suggestions',
  authenticate,
  authorize('task:assign'),
  taskEnterpriseController.getAssigneeSuggestions
);

// ============================================
// DEPENDENCY ROUTES
// ============================================

// Add dependency
router.post(
  '/tasks/:taskId/dependencies',
  authenticate,
  authorize('task:update'),
  taskEnterpriseController.addDependency
);

// Get task dependencies
router.get(
  '/tasks/:taskId/dependencies',
  authenticate,
  taskEnterpriseController.getTaskDependencies
);

// Remove dependency
router.delete(
  '/dependencies/:dependencyId',
  authenticate,
  authorize('task:update'),
  taskEnterpriseController.removeDependency
);

// ============================================
// CHECKLIST ROUTES
// ============================================

// Add checklist items
router.post(
  '/tasks/:taskId/checklists',
  authenticate,
  authorize('task:update'),
  taskEnterpriseController.addChecklist
);

// Get task checklists
router.get(
  '/tasks/:taskId/checklists',
  authenticate,
  taskEnterpriseController.getTaskChecklists
);

// Update checklist item
router.put(
  '/checklists/:checklistId',
  authenticate,
  taskEnterpriseController.updateChecklistItem
);

// ============================================
// MATERIAL ROUTES
// ============================================

// Link materials to task
router.post(
  '/tasks/:taskId/materials',
  authenticate,
  authorize('task:update'),
  taskEnterpriseController.linkMaterials
);

// Get task materials
router.get(
  '/tasks/:taskId/materials',
  authenticate,
  taskEnterpriseController.getTaskMaterials
);

// ============================================
// COMMENT ROUTES
// ============================================

// Add comment
router.post(
  '/tasks/:taskId/comments',
  authenticate,
  taskEnterpriseController.addComment
);

// Get task comments
router.get(
  '/tasks/:taskId/comments',
  authenticate,
  taskEnterpriseController.getTaskComments
);

// ============================================
// ALERT ROUTES
// ============================================

// Get task alerts
router.get(
  '/tasks/:taskId/alerts',
  authenticate,
  taskEnterpriseController.getTaskAlerts
);

// Dismiss alert
router.put(
  '/alerts/:alertId/dismiss',
  authenticate,
  taskEnterpriseController.dismissAlert
);

// ============================================
// GANTT & RESOURCES
// ============================================

// Get Gantt data
router.get(
  '/projects/:projectId/gantt',
  authenticate,
  taskEnterpriseController.getGanttData
);

// Get task resources
router.get(
  '/tasks/:taskId/resources',
  authenticate,
  taskEnterpriseController.getTaskResources
);

// Get cost entries
router.get(
  '/tasks/:taskId/costs',
  authenticate,
  taskEnterpriseController.getCostEntries
);

module.exports = router;
