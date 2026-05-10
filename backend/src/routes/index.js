const express = require('express');
const authRoutes = require('./v1/auth.routes');
const projectRoutes = require('./v1/project.routes');
const taskRoutes = require('./v1/task.routes');
const resourceRoutes = require('./v1/resource.routes');
const boqRoutes = require('./v1/boq.routes');
const materialRoutes = require('./v1/material.routes');
const reportRoutes = require('./v1/report.routes');
const aiRoutes = require('./v1/ai.routes');
const notificationRoutes = require('./v1/notification.routes');

// Enterprise Task Management Routes
const taskEnterpriseRoutes = require('./v1/task-enterprise.routes');
const approvalRoutes = require('./v1/approval.routes');
const progressRoutes = require('./v1/progress.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/resources', resourceRoutes);
router.use('/boq', boqRoutes);
router.use('/materials', materialRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);

// Enterprise Task Management
router.use('/enterprise', taskEnterpriseRoutes);
router.use('/approvals', approvalRoutes);
router.use('/progress', progressRoutes);

module.exports = router;
