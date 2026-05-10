const prisma = require('../utils/prisma');
const logger = require('../utils/logger');


// Get all tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, page = 1, limit = 50 } = req.query;

    const where = {};
    const skip = (page - 1) * limit;

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          status: true,
          priority: true,
          startDate: true,
          endDate: true,
          progress: true,
          createdAt: true,
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, firstName: true, lastName: true }
          },
          assignments: {
            select: {
              user: {
                select: { id: true, firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        meta: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    logger.error('Get all tasks error:', error);
    next(error);
  }
};

// Get task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    logger.error('Get task by ID error:', error);
    next(error);
  }
};

// Create task
exports.createTask = async (req, res, next) => {
  try {
    const {
      name,
      description,
      projectId,
      taskType = 'GENERAL',
      status = 'DRAFT',
      priority = 'MEDIUM',
      startDate,
      endDate,
      riskLevel = 'LOW',
      estimatedHours,
      estimatedCost = 0,
      location,
      requiresApproval = true,
      availableForAssignment = false,
      assigneeIds = []
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task name is required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const uniqueAssigneeIds = [...new Set(Array.isArray(assigneeIds) ? assigneeIds.filter(Boolean) : [])];

    if (uniqueAssigneeIds.length > 0) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          createdBy: true,
          members: {
            select: {
              userId: true
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const assignableUserIds = new Set([
        project.createdBy,
        ...project.members.map(member => member.userId)
      ]);

      const invalidAssigneeIds = uniqueAssigneeIds.filter(userId => !assignableUserIds.has(userId));

      if (invalidAssigneeIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Assignees must be project members or the project creator'
        });
      }
    }

    // Calculate duration (in days)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        projectId,
        taskType,
        status,
        priority,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: duration >= 0 ? duration : 0,
        riskLevel,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        location: location ? location.trim() : null,
        requiresApproval,
        availableForAssignment,
        createdBy: req.user.id,
        assignments: uniqueAssigneeIds.length > 0 ? {
          create: uniqueAssigneeIds.map(userId => ({
            userId,
            assignedBy: req.user.id
          }))
        } : undefined
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`Task created: ${task.name} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Create task error:', error);
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.actualStartDate) {
      updateData.actualStartDate = new Date(updateData.actualStartDate);
    }
    if (updateData.actualEndDate) {
      updateData.actualEndDate = new Date(updateData.actualEndDate);
    }
    if (updateData.estimatedHours !== undefined) {
      updateData.estimatedHours = parseFloat(updateData.estimatedHours);
    }
    if (updateData.actualHours !== undefined) {
      updateData.actualHours = parseFloat(updateData.actualHours);
    }
    if (updateData.progress !== undefined) {
      updateData.progress = parseFloat(updateData.progress);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`Task updated: ${task.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    logger.error('Update task error:', error);
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id }
    });

    logger.info(`Task deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    logger.error('Delete task error:', error);
    next(error);
  }
};
