const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', asyncHandler(notificationController.getNotifications));

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));

/**
 * @route   POST /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/mark-all-read', asyncHandler(notificationController.markAllAsRead));

/**
 * @route   POST /api/v1/notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post('/test', asyncHandler(notificationController.sendTestNotification));

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

module.exports = router;
