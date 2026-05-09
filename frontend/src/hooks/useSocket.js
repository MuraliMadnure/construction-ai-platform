import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import useTaskStore from '../stores/taskStore';
import useApprovalStore from '../stores/approvalStore';
import useProgressStore from '../stores/progressStore';

let sharedSocket = null;

/**
 * Socket.IO Client Hook for Real-time Updates
 * Manages a shared WebSocket connection and handles all real-time events
 * for task management, approvals, and progress tracking
 */
const useSocket = (projectId = null, options = {}) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Store actions
  const { updateTask, addTask, removeTask, updateGanttTask } = useTaskStore();
  const { addPendingApproval, updateApprovalStatus } = useApprovalStore();
  const { addDailyReport, updateReport } = useProgressStore();

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  const connect = useCallback(() => {
    if (sharedSocket?.connected) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No auth token found, skipping socket connection');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      const socket = sharedSocket;
      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        setIsConnected(true);

        if (projectId) {
          socket.emit('project:join', projectId);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Real-time connection failed');
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Setup event listeners
      setupTaskEventListeners(socket);
      setupGanttEventListeners(socket);
      setupApprovalEventListeners(socket);
      setupProgressEventListeners(socket);
      setupNotificationEventListeners(socket);
    } else {
      sharedSocket.auth = { token };
      sharedSocket.connect();
      socketRef.current = sharedSocket;
    }
  }, [projectId, updateTask, addTask, removeTask]);

  // ============================================
  // TASK EVENT LISTENERS
  // ============================================

  const setupTaskEventListeners = (socket) => {
    // Task updated
    socket.on('task:updated', (data) => {
      console.log('Task updated:', data);
      updateTask(data.taskId, data.updates);
    });

    // Task created
    socket.on('gantt:task_added', (data) => {
      console.log('Task created:', data);
      addTask(data.task);
    });

    // Task deleted
    socket.on('task:deleted', (data) => {
      console.log('Task deleted:', data);
      removeTask(data.taskId);
    });

    // Task progress changed
    socket.on('task:progress_changed', (data) => {
      console.log('Task progress changed:', data);
      updateTask(data.taskId, { progress: data.progress });
      toast.info(`Task progress updated: ${data.progress}%`);
    });

    // Task status changed
    socket.on('task:status_changed', (data) => {
      console.log('Task status changed:', data);
      updateTask(data.taskId, { status: data.newStatus });
      toast.info(`Task status: ${data.newStatus.replace('_', ' ')}`);
    });

    // Task assigned
    socket.on('task:assignee_changed', (data) => {
      console.log('Task assignee changed:', data);
      updateTask(data.taskId, {
        assignedTo: data.assigneeId,
        assigneeName: data.assigneeName
      });
    });

    // Task alert added
    socket.on('task:alert_added', (data) => {
      console.log('Task alert:', data.alert);
      const severity = data.alert.severity;
      const method = severity === 'CRITICAL' ? 'error' : 'warning';
      toast[method](data.alert.message);
    });

    // Project task updated
    socket.on('project:task_updated', (data) => {
      updateTask(data.taskId, data.changes);
    });

    // Project progress updated
    socket.on('project:progress_updated', (data) => {
      console.log('Project progress updated:', data);
    });
  };

  // ============================================
  // GANTT EVENT LISTENERS
  // ============================================

  const setupGanttEventListeners = (socket) => {
    // Task moved on Gantt
    socket.on('gantt:task_updated', (data) => {
      console.log('Gantt task updated:', data);
      updateGanttTask(data.taskId, {
        start_date: data.startDate,
        end_date: data.endDate,
        duration: data.duration
      });
      updateTask(data.taskId, {
        startDate: data.startDate,
        endDate: data.endDate
      });
    });

    // Dependency added
    socket.on('gantt:link_added', (data) => {
      console.log('Gantt link added:', data);
      // Handle dependency addition
    });

    // Dependency removed
    socket.on('gantt:link_removed', (data) => {
      console.log('Gantt link removed:', data);
      // Handle dependency removal
    });
  };

  // ============================================
  // APPROVAL EVENT LISTENERS
  // ============================================

  const setupApprovalEventListeners = (socket) => {
    // Approval required
    socket.on('notification:approval_required', (data) => {
      console.log('Approval required:', data);
      addPendingApproval(data);
      toast.warning('New approval request', {
        description: data.taskName,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/tasks/${data.taskId}`;
          }
        }
      });
    });

    // Approval result
    socket.on('notification:approval_result', (data) => {
      console.log('Approval result:', data);
      updateApprovalStatus(data.workflowId, data.action);

      const message = data.action === 'APPROVED'
        ? 'Task approved!'
        : data.action === 'REJECTED'
        ? 'Task rejected'
        : 'Revision requested';

      const method = data.action === 'APPROVED' ? 'success' : 'error';
      toast[method](message);
    });

    // Task approval status
    socket.on('task:approval_status', (data) => {
      updateTask(data.taskId, { status: data.status });
    });
  };

  // ============================================
  // PROGRESS EVENT LISTENERS
  // ============================================

  const setupProgressEventListeners = (socket) => {
    // Report pending review
    socket.on('notification:report_pending', (data) => {
      console.log('Report pending review:', data);
      toast.info('New daily report submitted', {
        description: data.taskName,
        action: {
          label: 'Review',
          onClick: () => {
            window.location.href = `/tasks/${data.taskId}/reports/${data.reportId}`;
          }
        }
      });
    });

    // Report reviewed
    socket.on('notification:report_reviewed', (data) => {
      console.log('Report reviewed:', data);
      updateReport(data.reportId, { reviewStatus: data.status });

      const message = data.status === 'APPROVED'
        ? 'Report approved!'
        : data.status === 'REJECTED'
        ? 'Report rejected'
        : 'Revision required';

      toast.info(message);
    });

    // Task report added
    socket.on('task:report_added', (data) => {
      console.log('Task report added:', data);
      updateTask(data.taskId, { progress: data.progress });
    });
  };

  // ============================================
  // NOTIFICATION EVENT LISTENERS
  // ============================================

  const setupNotificationEventListeners = (socket) => {
    // Task assigned notification
    socket.on('notification:task_assigned', (data) => {
      console.log('Task assigned:', data);
      toast.success('You have been assigned a new task!', {
        description: data.taskName,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/tasks/${data.taskId}`;
          }
        }
      });
    });

    // Alert notification
    socket.on('notification:alert', (data) => {
      console.log('Alert notification:', data);
      const method = data.severity === 'CRITICAL' ? 'error' : 'warning';
      toast[method](data.message, {
        description: data.type.replace('_', ' ').toUpperCase()
      });
    });

    // Generic notification
    socket.on('notification:new', (data) => {
      console.log('New notification:', data);
      toast.info(data.title, {
        description: data.message
      });
    });
  };

  // ============================================
  // EVENT EMITTERS
  // ============================================

  const joinProject = useCallback((projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('project:join', projectId);
    }
  }, []);

  const leaveProject = useCallback((projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('project:leave', projectId);
    }
  }, []);

  const subscribeToTask = useCallback((taskId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:subscribe', taskId);
    }
  }, []);

  const unsubscribeFromTask = useCallback((taskId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:unsubscribe', taskId);
    }
  }, []);

  const emitTaskProgress = useCallback((taskId, progress, projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:progress_update', {
        taskId,
        progress,
        projectId
      });
    }
  }, []);

  const emitTaskStatusChange = useCallback((taskId, oldStatus, newStatus) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:status_change', {
        taskId,
        oldStatus,
        newStatus
      });
    }
  }, []);

  const emitGanttTaskMoved = useCallback((projectId, taskId, startDate, endDate, duration) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('gantt:task_moved', {
        projectId,
        taskId,
        startDate,
        endDate,
        duration
      });
    }
  }, []);

  const emitTypingStart = useCallback((projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { projectId });
    }
  }, []);

  const emitTypingStop = useCallback((projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { projectId });
    }
  }, []);

  // ============================================
  // LIFECYCLE
  // ============================================

  useEffect(() => {
    if (!projectId) return;

    connect();

    return () => {
      if (socketRef.current) {
        if (projectId) {
          socketRef.current.emit('project:leave', projectId);
        }
        socketRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [connect, projectId]);

  // ============================================
  // RETURN API
  // ============================================

  return {
    socket: socketRef.current,
    isConnected,
    joinProject,
    leaveProject,
    subscribeToTask,
    unsubscribeFromTask,
    emitTaskProgress,
    emitTaskStatusChange,
    emitGanttTaskMoved,
    emitTypingStart,
    emitTypingStop
  };
};

export default useSocket;
