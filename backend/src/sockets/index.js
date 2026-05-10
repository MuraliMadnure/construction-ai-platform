const logger = require('../utils/logger');
const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

// Sanitize string input to prevent XSS
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 5000);
};

// Validate UUID format
const isValidId = (id) => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Initialize Socket.IO server
 * @param {Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      socket.authorizedProjects = new Set();

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle project join - with membership verification
    socket.on('project:join', async (projectId) => {
      if (!isValidId(projectId)) return;

      // Verify user is a member of this project or its creator
      const [membership, isCreator] = await Promise.all([
        prisma.projectMember.findFirst({
          where: { projectId, userId: socket.userId }
        }),
        prisma.project.findFirst({
          where: { id: projectId, createdBy: socket.userId },
          select: { id: true }
        })
      ]);

      if (!membership && !isCreator) {
        socket.emit('error', { message: 'Not authorized to join this project' });
        return;
      }

      socket.authorizedProjects.add(projectId);
      socket.join(`project:${projectId}`);
      logger.info(`User ${socket.userId} joined project ${projectId}`);

      socket.to(`project:${projectId}`).emit('user:joined', {
        userId: socket.userId,
        email: socket.userEmail
      });
    });

    // Handle project leave
    socket.on('project:leave', (projectId) => {
      if (!isValidId(projectId)) return;
      socket.authorizedProjects.delete(projectId);
      socket.leave(`project:${projectId}`);
      logger.info(`User ${socket.userId} left project ${projectId}`);

      socket.to(`project:${projectId}`).emit('user:left', {
        userId: socket.userId
      });
    });

    // Handle task updates
    socket.on('task:update', (data) => {
      if (!data || !isValidId(data.projectId) || !isValidId(data.taskId)) return;
      if (!socket.authorizedProjects.has(data.projectId)) return;

      io.to(`project:${data.projectId}`).emit('task:updated', {
        taskId: data.taskId,
        updates: data.updates,
        updatedBy: socket.userId
      });
    });

    // Handle chat messages - with XSS sanitization
    socket.on('chat:message', (data) => {
      if (!data || !isValidId(data.projectId)) return;
      if (!socket.authorizedProjects.has(data.projectId)) return;

      const message = sanitizeInput(data.message);
      if (!message) return;

      io.to(`project:${data.projectId}`).emit('chat:message', {
        message,
        userId: socket.userId,
        email: socket.userEmail,
        timestamp: new Date().toISOString()
      });
    });

    // Handle AI chat
    socket.on('ai:chat', async (data) => {
      if (!data) return;
      const message = sanitizeInput(data.message);
      if (!message) return;

      socket.emit('ai:response', {
        message: 'AI response would go here',
        timestamp: new Date().toISOString()
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      if (!data || !isValidId(data.projectId)) return;
      if (!socket.authorizedProjects.has(data.projectId)) return;
      socket.to(`project:${data.projectId}`).emit('typing:start', {
        userId: socket.userId
      });
    });

    socket.on('typing:stop', (data) => {
      if (!data || !isValidId(data.projectId)) return;
      if (!socket.authorizedProjects.has(data.projectId)) return;
      socket.to(`project:${data.projectId}`).emit('typing:stop', {
        userId: socket.userId
      });
    });

    // ============================================
    // ENTERPRISE TASK MANAGEMENT - REAL-TIME EVENTS
    // ============================================

    // Subscribe to task updates
    socket.on('task:subscribe', (taskId) => {
      socket.join(`task:${taskId}`);
      logger.info(`User ${socket.userId} subscribed to task ${taskId}`);
    });

    socket.on('task:unsubscribe', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // Task progress update (real-time)
    socket.on('task:progress_update', (data) => {
      io.to(`task:${data.taskId}`).emit('task:progress_changed', {
        taskId: data.taskId,
        progress: data.progress,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

      // Also update project subscribers
      if (data.projectId) {
        io.to(`project:${data.projectId}`).emit('project:task_progress', {
          taskId: data.taskId,
          progress: data.progress
        });
      }
    });

    // Task status changed
    socket.on('task:status_change', (data) => {
      io.to(`task:${data.taskId}`).emit('task:status_changed', {
        taskId: data.taskId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Task assigned event
    socket.on('task:assigned', (data) => {
      // Notify assignee
      io.to(`user:${data.assigneeId}`).emit('notification:task_assigned', {
        taskId: data.taskId,
        taskName: data.taskName,
        projectId: data.projectId,
        assignedBy: socket.userId,
        timestamp: new Date()
      });

      // Update task room
      io.to(`task:${data.taskId}`).emit('task:assignee_changed', {
        taskId: data.taskId,
        assigneeId: data.assigneeId,
        assigneeName: data.assigneeName
      });
    });

    // ============================================
    // GANTT CHART REAL-TIME SYNC
    // ============================================

    // Task moved on Gantt (drag/resize)
    socket.on('gantt:task_moved', (data) => {
      socket.to(`project:${data.projectId}`).emit('gantt:task_updated', {
        taskId: data.taskId,
        startDate: data.startDate,
        endDate: data.endDate,
        duration: data.duration,
        updatedBy: socket.userId
      });
    });

    // Dependency added on Gantt
    socket.on('gantt:link_created', (data) => {
      socket.to(`project:${data.projectId}`).emit('gantt:link_added', {
        linkId: data.linkId,
        source: data.source,
        target: data.target,
        type: data.type,
        createdBy: socket.userId
      });
    });

    // Dependency removed
    socket.on('gantt:link_deleted', (data) => {
      socket.to(`project:${data.projectId}`).emit('gantt:link_removed', {
        linkId: data.linkId,
        deletedBy: socket.userId
      });
    });

    // Task created on Gantt
    socket.on('gantt:task_created', (data) => {
      socket.to(`project:${data.projectId}`).emit('gantt:task_added', {
        task: data.task,
        createdBy: socket.userId
      });
    });

    // ============================================
    // DAILY PROGRESS REPORTS
    // ============================================

    // Daily report submitted
    socket.on('progress:report_submitted', (data) => {
      // Notify supervisor/PM
      io.to(`user:${data.supervisorId}`).emit('notification:report_pending', {
        reportId: data.reportId,
        taskId: data.taskId,
        taskName: data.taskName,
        submittedBy: socket.userId,
        submittedByName: data.submittedByName,
        timestamp: new Date()
      });

      // Update task with new progress
      io.to(`task:${data.taskId}`).emit('task:report_added', {
        reportId: data.reportId,
        progress: data.cumulativeProgress,
        timestamp: new Date()
      });
    });

    // Report reviewed
    socket.on('progress:report_reviewed', (data) => {
      // Notify reporter
      io.to(`user:${data.reporterId}`).emit('notification:report_reviewed', {
        reportId: data.reportId,
        status: data.status,
        comments: data.comments,
        reviewedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // ============================================
    // APPROVAL WORKFLOW
    // ============================================

    // Approval requested
    socket.on('approval:request', (data) => {
      // Notify approver
      io.to(`user:${data.approverId}`).emit('notification:approval_required', {
        workflowId: data.workflowId,
        taskId: data.taskId,
        taskName: data.taskName,
        approvalType: data.approvalType,
        priority: data.priority,
        deadline: data.deadline,
        timestamp: new Date()
      });
    });

    // Approval completed
    socket.on('approval:completed', (data) => {
      // Notify task creator
      io.to(`user:${data.creatorId}`).emit('notification:approval_result', {
        workflowId: data.workflowId,
        taskId: data.taskId,
        action: data.action,
        comments: data.comments,
        approvedBy: socket.userId,
        timestamp: new Date()
      });

      // Update task status
      io.to(`task:${data.taskId}`).emit('task:approval_status', {
        taskId: data.taskId,
        status: data.newStatus,
        approvedBy: socket.userId
      });
    });

    // ============================================
    // ALERTS & NOTIFICATIONS
    // ============================================

    // Task alert created
    socket.on('alert:created', (data) => {
      // Notify relevant users
      if (data.notifyUserIds && Array.isArray(data.notifyUserIds)) {
        data.notifyUserIds.forEach(userId => {
          io.to(`user:${userId}`).emit('notification:alert', {
            alertId: data.alertId,
            taskId: data.taskId,
            type: data.type,
            severity: data.severity,
            message: data.message,
            timestamp: new Date()
          });
        });
      }

      // Update task with alert
      io.to(`task:${data.taskId}`).emit('task:alert_added', {
        alert: data.alert
      });
    });

    // ============================================
    // COLLABORATIVE FEATURES
    // ============================================

    // User viewing task
    socket.on('task:viewing', (data) => {
      socket.to(`task:${data.taskId}`).emit('task:user_viewing', {
        userId: socket.userId,
        userName: data.userName,
        timestamp: new Date()
      });
    });

    // User stopped viewing
    socket.on('task:stopped_viewing', (data) => {
      socket.to(`task:${data.taskId}`).emit('task:user_left', {
        userId: socket.userId
      });
    });

    // Comment added to task
    socket.on('task:comment_added', (data) => {
      socket.to(`task:${data.taskId}`).emit('task:new_comment', {
        commentId: data.commentId,
        comment: data.comment,
        user: data.user,
        timestamp: new Date()
      });
    });

    // Checklist item updated
    socket.on('task:checklist_updated', (data) => {
      io.to(`task:${data.taskId}`).emit('task:checklist_changed', {
        checklistId: data.checklistId,
        completed: data.completed,
        completedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  logger.info('Socket.IO server initialized');
};

/**
 * Emit notification to specific user
 * @param {Server} io - Socket.IO server instance
 * @param {String} userId - User ID
 * @param {Object} notification - Notification data
 */
const emitToUser = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

/**
 * Emit event to project members
 * @param {Server} io - Socket.IO server instance
 * @param {String} projectId - Project ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToProject = (io, projectId, event, data) => {
  io.to(`project:${projectId}`).emit(event, data);
};

/**
 * Broadcast system-wide notification
 * @param {Server} io - Socket.IO server instance
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const broadcastAll = (io, event, data) => {
  io.emit(event, data);
};

// ============================================
// ENTERPRISE TASK MANAGEMENT - UTILITY FUNCTIONS
// ============================================

/**
 * Emit task update to subscribers
 * @param {Server} io - Socket.IO server instance
 * @param {String} taskId - Task ID
 * @param {String} projectId - Project ID
 * @param {Object} changes - Changes made to task
 */
const emitTaskUpdate = (io, taskId, projectId, changes) => {
  io.to(`task:${taskId}`).emit('task:updated', {
    taskId,
    changes,
    timestamp: new Date()
  });

  io.to(`project:${projectId}`).emit('project:task_updated', {
    taskId,
    changes
  });
};

/**
 * Emit task progress update
 * @param {Server} io - Socket.IO server instance
 * @param {String} taskId - Task ID
 * @param {String} projectId - Project ID
 * @param {Number} progress - Progress percentage
 */
const emitProgressUpdate = (io, taskId, projectId, progress) => {
  io.to(`task:${taskId}`).emit('task:progress_changed', {
    taskId,
    progress,
    timestamp: new Date()
  });

  io.to(`project:${projectId}`).emit('project:progress_updated', {
    taskId,
    progress
  });
};

/**
 * Emit task alert to relevant users
 * @param {Server} io - Socket.IO server instance
 * @param {String} taskId - Task ID
 * @param {Object} alert - Alert object
 * @param {Array} userIds - Array of user IDs to notify
 */
const emitTaskAlert = (io, taskId, alert, userIds) => {
  io.to(`task:${taskId}`).emit('task:alert_added', { alert });

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit('notification:alert', {
      ...alert,
      timestamp: new Date()
    });
  });
};

/**
 * Emit approval notification
 * @param {Server} io - Socket.IO server instance
 * @param {String} userId - User ID
 * @param {Object} approvalData - Approval data
 */
const emitApprovalNotification = (io, userId, approvalData) => {
  io.to(`user:${userId}`).emit('notification:approval_required', {
    ...approvalData,
    timestamp: new Date()
  });
};

/**
 * Emit daily report notification
 * @param {Server} io - Socket.IO server instance
 * @param {String} supervisorId - Supervisor user ID
 * @param {Object} reportData - Report data
 */
const emitReportNotification = (io, supervisorId, reportData) => {
  io.to(`user:${supervisorId}`).emit('notification:report_pending', {
    ...reportData,
    timestamp: new Date()
  });
};

/**
 * Emit Gantt chart update to project
 * @param {Server} io - Socket.IO server instance
 * @param {String} projectId - Project ID
 * @param {String} excludeSocketId - Socket ID to exclude (updater)
 * @param {Object} update - Gantt update data
 */
const emitGanttUpdate = (io, projectId, excludeSocketId, update) => {
  if (excludeSocketId) {
    io.to(`project:${projectId}`).except(excludeSocketId).emit('gantt:updated', update);
  } else {
    io.to(`project:${projectId}`).emit('gantt:updated', update);
  }
};

/**
 * Emit task assignment notification
 * @param {Server} io - Socket.IO server instance
 * @param {String} assigneeId - Assignee user ID
 * @param {Object} taskData - Task assignment data
 */
const emitTaskAssignment = (io, assigneeId, taskData) => {
  io.to(`user:${assigneeId}`).emit('notification:task_assigned', {
    ...taskData,
    timestamp: new Date()
  });
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToProject,
  broadcastAll,
  // Enterprise task management utilities
  emitTaskUpdate,
  emitProgressUpdate,
  emitTaskAlert,
  emitApprovalNotification,
  emitReportNotification,
  emitGanttUpdate,
  emitTaskAssignment
};
