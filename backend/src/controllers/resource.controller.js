const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get all workers
exports.getAllWorkers = async (req, res, next) => {
  try {
    const { status, skillType } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (skillType) {
      where.skillType = { contains: skillType, mode: 'insensitive' };
    }

    const workers = await prisma.worker.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { workers }
    });
  } catch (error) {
    logger.error('Get all workers error:', error);
    next(error);
  }
};

// Get worker by ID
exports.getWorkerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const worker = await prisma.worker.findUnique({
      where: { id }
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.json({
      success: true,
      data: { worker }
    });
  } catch (error) {
    logger.error('Get worker by ID error:', error);
    next(error);
  }
};

// Create worker
exports.createWorker = async (req, res, next) => {
  try {
    const {
      name,
      contactNumber,
      email,
      skillType,
      experienceYears,
      dailyWage,
      joinedDate,
      status
    } = req.body;

    const worker = await prisma.worker.create({
      data: {
        name,
        contactNumber,
        email,
        skillType,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        dailyWage: dailyWage ? parseFloat(dailyWage) : null,
        joinedDate: joinedDate ? new Date(joinedDate) : null,
        status: status || 'ACTIVE'
      }
    });

    logger.info(`Worker created: ${worker.name} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: { worker }
    });
  } catch (error) {
    logger.error('Create worker error:', error);
    next(error);
  }
};

// Update worker
exports.updateWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dailyWage !== undefined) {
      updateData.dailyWage = parseFloat(updateData.dailyWage);
    }
    if (updateData.experienceYears !== undefined) {
      updateData.experienceYears = parseInt(updateData.experienceYears);
    }
    if (updateData.joinedDate) {
      updateData.joinedDate = new Date(updateData.joinedDate);
    }
    if (updateData.leftDate) {
      updateData.leftDate = new Date(updateData.leftDate);
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: updateData
    });

    logger.info(`Worker updated: ${worker.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Worker updated successfully',
      data: { worker }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    logger.error('Update worker error:', error);
    next(error);
  }
};

// Delete worker
exports.deleteWorker = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.worker.delete({
      where: { id }
    });

    logger.info(`Worker deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    logger.error('Delete worker error:', error);
    next(error);
  }
};

// Get all equipment
exports.getAllEquipment = async (req, res, next) => {
  try {
    const { status, equipmentType } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (equipmentType) {
      where.equipmentType = { contains: equipmentType, mode: 'insensitive' };
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { equipment }
    });
  } catch (error) {
    logger.error('Get all equipment error:', error);
    next(error);
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: { equipment }
    });
  } catch (error) {
    logger.error('Get equipment by ID error:', error);
    next(error);
  }
};

// Create equipment
exports.createEquipment = async (req, res, next) => {
  try {
    const {
      name,
      equipmentType,
      model,
      serialNumber,
      purchaseDate,
      purchaseCost,
      dailyRentalCost,
      status
    } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        equipmentType,
        model,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        dailyRentalCost: dailyRentalCost ? parseFloat(dailyRentalCost) : null,
        status: status || 'AVAILABLE'
      }
    });

    logger.info(`Equipment created: ${equipment.name} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: { equipment }
    });
  } catch (error) {
    logger.error('Create equipment error:', error);
    next(error);
  }
};

// Update equipment
exports.updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dailyRentalCost !== undefined) {
      updateData.dailyRentalCost = parseFloat(updateData.dailyRentalCost);
    }
    if (updateData.purchaseCost !== undefined) {
      updateData.purchaseCost = parseFloat(updateData.purchaseCost);
    }
    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }
    if (updateData.lastMaintenanceDate) {
      updateData.lastMaintenanceDate = new Date(updateData.lastMaintenanceDate);
    }
    if (updateData.nextMaintenanceDate) {
      updateData.nextMaintenanceDate = new Date(updateData.nextMaintenanceDate);
    }

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData
    });

    logger.info(`Equipment updated: ${equipment.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: { equipment }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    logger.error('Update equipment error:', error);
    next(error);
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.equipment.delete({
      where: { id }
    });

    logger.info(`Equipment deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    logger.error('Delete equipment error:', error);
    next(error);
  }
};
