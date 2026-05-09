const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { requirePermission } = require('../../middleware/rbac.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const boqController = require('../../controllers/boq.controller');

const router = express.Router();

// All BOQ routes require authentication
router.use(authenticate);

// BOQ
router.get('/projects/:projectId', requirePermission('boq:read'), asyncHandler(boqController.getBOQByProject));
router.post('/', requirePermission('boq:write'), asyncHandler(boqController.createBOQ));

// BOQ Items
router.post('/:boqId/items', requirePermission('boq:write'), asyncHandler(boqController.addBOQItem));
router.put('/items/:itemId', requirePermission('boq:write'), asyncHandler(boqController.updateBOQItem));
router.delete('/items/:itemId', requirePermission('boq:delete'), asyncHandler(boqController.deleteBOQItem));

// BOQ Line Items
router.post('/items/:itemId/line-items', requirePermission('boq:write'), asyncHandler(boqController.addLineItem));
router.put('/line-items/:lineItemId', requirePermission('boq:write'), asyncHandler(boqController.updateLineItem));
router.delete('/line-items/:lineItemId', requirePermission('boq:delete'), asyncHandler(boqController.deleteLineItem));

module.exports = router;
