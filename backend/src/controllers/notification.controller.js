const notificationService = require('../services/notification.service');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');


/**
 * Get user notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all as read error:', error);
    next(error);
  }
};

/**
 * Get unread count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    next(error);
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.delete({
      where: {
        id,
        userId // Ensure user owns this notification
      }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    next(error);
  }
};

/**
 * Send test notification
 */
exports.sendTestNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await notificationService.sendInAppNotification(userId, {
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from the system',
      link: '/dashboard'
    });

    res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    logger.error('Send test notification error:', error);
    next(error);
  }
};
