const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');
const config = require('../config');
const logger = require('../utils/logger');


class NotificationService {
  constructor() {
    // Configure email transporter (optional - only if SMTP credentials provided)
    this.transporter = null;
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        logger.info('Email transporter configured successfully');
      } else {
        logger.info('Email notifications disabled - no SMTP credentials provided');
      }
    } catch (error) {
      logger.warn('Failed to configure email transporter:', error.message);
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(userId, notification) {
    try {
      const notif = await prisma.notification.create({
        data: {
          userId,
          type: notification.type || 'info',
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata
        }
      });

      // TODO: Emit socket event for real-time notification (requires io instance)

      return notif;
    } catch (error) {
      logger.error('In-app notification error:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, html, options = {}) {
    try {
      if (!this.transporter) {
        logger.warn('SMTP not configured, skipping email send');
        return null;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);

      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Notify about task assignment
   */
  async notifyTaskAssignment(task, assignee) {
    try {
      // In-app notification
      await this.sendInAppNotification(assignee.id, {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned: ${task.title}`,
        actionUrl: `/tasks/${task.id}`,
        metadata: { taskId: task.id }
      });

      // Email notification
      const emailHtml = this.getTaskAssignmentEmail(task, assignee);
      await this.sendEmail(
        assignee.email,
        `New Task: ${task.title}`,
        emailHtml
      );

      logger.info(`Task assignment notification sent to ${assignee.email}`);
    } catch (error) {
      logger.error('Task assignment notification error:', error);
    }
  }

  /**
   * Notify about project delay
   */
  async notifyProjectDelay(project, stakeholders, delayInfo) {
    try {
      const notifications = stakeholders.map(user =>
        this.sendInAppNotification(user.id, {
          type: 'delay_warning',
          title: 'Project Delay Alert',
          message: `${project.name} is delayed by ${delayInfo.days} days`,
          actionUrl: `/projects/${project.id}`,
          metadata: { projectId: project.id, delayDays: delayInfo.days }
        })
      );

      await Promise.all(notifications);

      // Send email to project manager
      const manager = stakeholders.find(u => u.role === 'project_manager');
      if (manager) {
        const emailHtml = this.getProjectDelayEmail(project, delayInfo);
        await this.sendEmail(
          manager.email,
          `Project Delay Alert: ${project.name}`,
          emailHtml
        );
      }

      logger.info(`Delay notifications sent for project ${project.id}`);
    } catch (error) {
      logger.error('Project delay notification error:', error);
    }
  }

  /**
   * Notify about budget overrun
   */
  async notifyBudgetOverrun(project, stakeholders, budgetInfo) {
    try {
      const notifications = stakeholders.map(user =>
        this.sendInAppNotification(user.id, {
          type: 'budget_alert',
          title: 'Budget Overrun Warning',
          message: `${project.name} budget variance: ${budgetInfo.variance}%`,
          actionUrl: `/projects/${project.id}/budget`,
          metadata: { projectId: project.id, variance: budgetInfo.variance }
        })
      );

      await Promise.all(notifications);

      logger.info(`Budget overrun notifications sent for project ${project.id}`);
    } catch (error) {
      logger.error('Budget overrun notification error:', error);
    }
  }

  /**
   * Notify about low material stock
   */
  async notifyLowStock(material, threshold) {
    try {
      // Find purchase team members
      const purchaseTeam = await prisma.user.findMany({
        where: { role: 'purchase_team' }
      });

      const notifications = purchaseTeam.map(user =>
        this.sendInAppNotification(user.id, {
          type: 'stock_alert',
          title: 'Low Stock Alert',
          message: `${material.name} stock below minimum threshold (${material.stock} ${material.unit})`,
          actionUrl: `/materials`,
          metadata: { materialId: material.id, currentStock: material.stock }
        })
      );

      await Promise.all(notifications);

      logger.info(`Low stock notifications sent for ${material.name}`);
    } catch (error) {
      logger.error('Low stock notification error:', error);
    }
  }

  /**
   * Notify about safety violation
   */
  async notifySafetyViolation(violation, project) {
    try {
      // Find project stakeholders and safety officers
      const stakeholders = await prisma.projectMember.findMany({
        where: {
          projectId: project.id,
          OR: [
            { role: 'manager' },
            { role: 'safety_officer' }
          ]
        },
        include: { user: true }
      });

      const notifications = stakeholders.map(member =>
        this.sendInAppNotification(member.userId, {
          type: 'safety_alert',
          title: 'Safety Violation Detected',
          message: `Critical: ${violation.description} at ${project.name}`,
          actionUrl: `/reports/issues/${violation.id}`,
          metadata: { violationId: violation.id, severity: violation.severity }
        })
      );

      await Promise.all(notifications);

      // Send urgent emails
      const emails = stakeholders.map(member =>
        this.sendEmail(
          member.user.email,
          `URGENT: Safety Violation - ${project.name}`,
          this.getSafetyViolationEmail(violation, project)
        )
      );

      await Promise.all(emails);

      logger.info(`Safety violation notifications sent for project ${project.id}`);
    } catch (error) {
      logger.error('Safety violation notification error:', error);
    }
  }

  /**
   * Daily report reminder
   */
  async sendDailyReportReminder(projectId) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            where: {
              role: { in: ['manager', 'site_engineer'] }
            },
            include: { user: true }
          }
        }
      });

      if (!project) return;

      const notifications = project.members.map(member =>
        this.sendInAppNotification(member.userId, {
          type: 'reminder',
          title: 'Daily Report Reminder',
          message: `Please submit daily report for ${project.name}`,
          actionUrl: `/projects/${projectId}/reports/new`,
          metadata: { projectId }
        })
      );

      await Promise.all(notifications);

      logger.info(`Daily report reminders sent for project ${projectId}`);
    } catch (error) {
      logger.error('Daily report reminder error:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId // Ensure user owns this notification
        },
        data: { read: true }
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, unreadOnly = false } = options;

      const where = { userId };
      if (unreadOnly) {
        where.read = false;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, read: false }
      });

      return {
        notifications,
        unreadCount
      };
    } catch (error) {
      logger.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Email templates
  getTaskAssignmentEmail(task, assignee) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Task Assigned</h2>
        <p>Hello ${assignee.firstName},</p>
        <p>You have been assigned a new task:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>${task.title}</h3>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${task.dueDate}</p>
          <p><strong>Description:</strong> ${task.description || 'No description'}</p>
        </div>
        <p>Please log in to the platform to view details and update progress.</p>
        <a href="${config.frontend.url}/tasks/${task.id}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          View Task
        </a>
      </div>
    `;
  }

  getProjectDelayEmail(project, delayInfo) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Project Delay Alert</h2>
        <p>Project <strong>${project.name}</strong> is experiencing delays.</p>
        <div style="background: #FEE2E2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <p><strong>Delay Duration:</strong> ${delayInfo.days} days</p>
          <p><strong>Reasons:</strong></p>
          <ul>
            ${delayInfo.reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
          <p><strong>Recommendations:</strong></p>
          <ul>
            ${delayInfo.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        <p>Please review and take necessary action.</p>
        <a href="${config.frontend.url}/projects/${project.id}" style="background: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          View Project
        </a>
      </div>
    `;
  }

  getSafetyViolationEmail(violation, project) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">⚠️ URGENT: Safety Violation Detected</h2>
        <p>A safety violation has been reported at <strong>${project.name}</strong>.</p>
        <div style="background: #FEE2E2; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #DC2626;">
          <p><strong>Severity:</strong> ${violation.severity.toUpperCase()}</p>
          <p><strong>Description:</strong> ${violation.description}</p>
          <p><strong>Time:</strong> ${new Date(violation.createdAt).toLocaleString()}</p>
        </div>
        <p style="color: #DC2626; font-weight: bold;">Immediate action required!</p>
        <a href="${config.frontend.url}/reports/issues/${violation.id}" style="background: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
          View Details & Take Action
        </a>
      </div>
    `;
  }
}

module.exports = new NotificationService();
