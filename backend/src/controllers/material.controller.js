const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get all materials
exports.getAllMaterials = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { materials }
    });
  } catch (error) {
    logger.error('Get all materials error:', error);
    next(error);
  }
};

// Get material by ID
exports.getMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      data: { material }
    });
  } catch (error) {
    logger.error('Get material by ID error:', error);
    next(error);
  }
};

// Create material
exports.createMaterial = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      unitCost,
      currentStock,
      minStockLevel,
      maxStockLevel,
      status
    } = req.body;

    const material = await prisma.material.create({
      data: {
        name,
        description,
        category,
        unit,
        unitCost: unitCost ? parseFloat(unitCost) : null,
        currentStock: parseFloat(currentStock || 0),
        minStockLevel: parseFloat(minStockLevel || 0),
        maxStockLevel: maxStockLevel ? parseFloat(maxStockLevel) : null,
        status: status || 'ACTIVE'
      }
    });

    logger.info(`Material created: ${material.name} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: { material }
    });
  } catch (error) {
    logger.error('Create material error:', error);
    next(error);
  }
};

// Update material
exports.updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.unitCost !== undefined) {
      updateData.unitCost = parseFloat(updateData.unitCost);
    }
    if (updateData.currentStock !== undefined) {
      updateData.currentStock = parseFloat(updateData.currentStock);
    }
    if (updateData.minStockLevel !== undefined) {
      updateData.minStockLevel = parseFloat(updateData.minStockLevel);
    }
    if (updateData.maxStockLevel !== undefined) {
      updateData.maxStockLevel = parseFloat(updateData.maxStockLevel);
    }

    const material = await prisma.material.update({
      where: { id },
      data: updateData
    });

    logger.info(`Material updated: ${material.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: { material }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    logger.error('Update material error:', error);
    next(error);
  }
};

// Delete material
exports.deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.material.delete({
      where: { id }
    });

    logger.info(`Material deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    logger.error('Delete material error:', error);
    next(error);
  }
};

// Get purchase orders (material orders)
exports.getMaterialOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                unit: true
              }
            }
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
        vendor: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    logger.error('Get material orders error:', error);
    next(error);
  }
};

// Create purchase order (material order)
exports.createMaterialOrder = async (req, res, next) => {
  try {
    const {
      vendorId,
      items,
      notes
    } = req.body;

    // This is a simplified version - in reality you'd want to create the order with items
    res.status(501).json({
      success: false,
      message: 'Purchase order creation not yet implemented - use purchase order endpoints'
    });
  } catch (error) {
    logger.error('Create material order error:', error);
    next(error);
  }
};
