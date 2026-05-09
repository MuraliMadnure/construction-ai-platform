const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const projectController = require('../../controllers/project.controller');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', requirePermission('project:read'), asyncHandler(projectController.getAllProjects));

/**
 * @route   POST /api/v1/projects
 * @desc    Create new project
 * @access  Private (requires project:write permission)
 */
router.post('/', requirePermission('project:write'), asyncHandler(projectController.createProject));

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id/dashboard', requirePermission('project:read'), asyncHandler(projectController.getProjectDashboard));
router.get('/:id/members', requirePermission('project:read'), asyncHandler(projectController.getProjectMembers));
router.get('/:id', requirePermission('project:read'), asyncHandler(projectController.getProjectById));

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', requirePermission('project:write'), asyncHandler(projectController.updateProject));

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', requirePermission('project:delete'), asyncHandler(projectController.deleteProject));

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add project member
 * @access  Private
 */
router.post('/:id/members', requirePermission('project:write'), asyncHandler(projectController.addProjectMember));

module.exports = router;
