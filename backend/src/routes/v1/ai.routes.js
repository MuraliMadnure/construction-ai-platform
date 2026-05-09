const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const aiController = require('../../controllers/ai.controller');

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/ai/projects/:id/delay-prediction
 * @desc    Get AI delay prediction for project
 * @access  Private
 */
router.get('/projects/:id/delay-prediction', asyncHandler(aiController.predictProjectDelay));

/**
 * @route   GET /api/v1/ai/projects/:id/budget-prediction
 * @desc    Get AI budget overrun prediction
 * @access  Private
 */
router.get('/projects/:id/budget-prediction', asyncHandler(aiController.predictBudgetOverrun));

/**
 * @route   GET /api/v1/ai/projects/:id/insights
 * @desc    Get comprehensive AI insights for project
 * @access  Private
 */
router.get('/projects/:id/insights', asyncHandler(aiController.getProjectInsights));

/**
 * @route   GET /api/v1/ai/reports/:reportId/summary
 * @desc    Generate AI summary for daily report
 * @access  Private
 */
router.get('/reports/:reportId/summary', asyncHandler(aiController.generateDailySummary));

/**
 * @route   POST /api/v1/ai/boq/estimate
 * @desc    Get AI BOQ estimation
 * @access  Private
 */
router.post('/boq/estimate', asyncHandler(aiController.estimateBOQ));

/**
 * @route   POST /api/v1/ai/chatbot
 * @desc    AI Chatbot endpoint
 * @access  Private
 */
router.post('/chatbot', asyncHandler(aiController.chatbot));

/**
 * @route   GET /api/v1/ai/productivity/analyze
 * @desc    Analyze worker productivity
 * @access  Private
 */
router.get('/productivity/analyze', asyncHandler(aiController.analyzeProductivity));

module.exports = router;
