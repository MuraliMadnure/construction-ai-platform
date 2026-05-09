const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const taskController = require('../../controllers/task.controller');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', requirePermission('task:read'), asyncHandler(taskController.getAllTasks));
router.post('/', requirePermission('task:write'), asyncHandler(taskController.createTask));
router.get('/:id', requirePermission('task:read'), asyncHandler(taskController.getTaskById));
router.put('/:id', requirePermission('task:write'), asyncHandler(taskController.updateTask));
router.delete('/:id', requirePermission('task:delete'), asyncHandler(taskController.deleteTask));

module.exports = router;
