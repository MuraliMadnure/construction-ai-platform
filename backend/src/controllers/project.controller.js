const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              tasks: true,
              members: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        projects,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all projects error:', error);
    next(error);
  }
};

// Get project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true
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

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    logger.error('Get project by ID error:', error);
    next(error);
  }
};

// Create project
exports.createProject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      projectType,
      status,
      startDate,
      endDate,
      budget,
      location
    } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        projectType: projectType || 'RESIDENTIAL',
        status: status || 'PLANNING',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        location,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Project created: ${project.name} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Create project error:', error);
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.budget) {
      updateData.budget = parseFloat(updateData.budget);
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'progress')) {
      const progress = parseFloat(updateData.progress);

      if (Number.isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress must be a number between 0 and 100'
        });
      }

      updateData.progress = progress;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Project updated: ${project.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    logger.error('Update project error:', error);
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    logger.info(`Project deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    logger.error('Delete project error:', error);
    next(error);
  }
};

// Get project dashboard
exports.getProjectDashboard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [project, tasks, resources, expenses] = await Promise.all([
      prisma.project.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              tasks: true,
              members: true
            }
          }
        }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id },
        _count: true
      }),
      prisma.resourceAllocation.count({
        where: { projectId: id }
      }),
      prisma.expense.aggregate({
        where: { projectId: id },
        _sum: { amount: true }
      })
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const taskStats = tasks.reduce((acc, task) => {
      acc[task.status] = task._count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        overview: {
          name: project.name,
          status: project.status,
          progress: project.progress || 0,
          budget: project.budget,
          spent: expenses._sum.amount || 0
        },
        tasks: taskStats,
        budget: {
          total: project.budget,
          spent: expenses._sum.amount || 0,
          remaining: project.budget - (expenses._sum.amount || 0)
        },
        resources: {
          total: resources,
          workers: project._count.members
        },
        alerts: [] // TODO: Implement alerts logic
      }
    });
  } catch (error) {
    logger.error('Get project dashboard error:', error);
    next(error);
  }
};

// Get project members
exports.getProjectMembers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    logger.error('Get project members error:', error);
    next(error);
  }
};

// Add project member
exports.addProjectMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    // Check if member already exists
    const existing = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: role || 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    logger.info(`Member added to project ${id}: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member }
    });
  } catch (error) {
    logger.error('Add project member error:', error);
    next(error);
  }
};
