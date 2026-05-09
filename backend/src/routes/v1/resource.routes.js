const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const resourceController = require('../../controllers/resource.controller');

const router = express.Router();

// All resource routes require authentication
router.use(authenticate);

// Workers
router.get('/workers', requirePermission('resource:read'), asyncHandler(resourceController.getAllWorkers));
router.post('/workers', requirePermission('resource:write'), asyncHandler(resourceController.createWorker));
router.get('/workers/:id', requirePermission('resource:read'), asyncHandler(resourceController.getWorkerById));
router.put('/workers/:id', requirePermission('resource:write'), asyncHandler(resourceController.updateWorker));
router.delete('/workers/:id', requirePermission('resource:delete'), asyncHandler(resourceController.deleteWorker));

// Equipment
router.get('/equipment', requirePermission('resource:read'), asyncHandler(resourceController.getAllEquipment));
router.post('/equipment', requirePermission('resource:write'), asyncHandler(resourceController.createEquipment));
router.get('/equipment/:id', requirePermission('resource:read'), asyncHandler(resourceController.getEquipmentById));
router.put('/equipment/:id', requirePermission('resource:write'), asyncHandler(resourceController.updateEquipment));
router.delete('/equipment/:id', requirePermission('resource:delete'), asyncHandler(resourceController.deleteEquipment));

module.exports = router;
