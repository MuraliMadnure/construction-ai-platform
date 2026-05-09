const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const materialController = require('../../controllers/material.controller');

const router = express.Router();

// All material routes require authentication
router.use(authenticate);

// Material Orders (must be BEFORE /:id routes)
router.get('/orders', requirePermission('material:read'), asyncHandler(materialController.getMaterialOrders));
router.post('/orders', requirePermission('material:write'), asyncHandler(materialController.createMaterialOrder));

// Materials & Inventory
router.get('/inventory', requirePermission('material:read'), asyncHandler(materialController.getAllMaterials));
router.get('/', requirePermission('material:read'), asyncHandler(materialController.getAllMaterials));
router.post('/inventory', requirePermission('material:write'), asyncHandler(materialController.createMaterial));
router.post('/', requirePermission('material:write'), asyncHandler(materialController.createMaterial));

// Parameterized routes (must be LAST)
router.get('/:id', requirePermission('material:read'), asyncHandler(materialController.getMaterialById));
router.put('/:id', requirePermission('material:write'), asyncHandler(materialController.updateMaterial));
router.delete('/:id', requirePermission('material:delete'), asyncHandler(materialController.deleteMaterial));

module.exports = router;
