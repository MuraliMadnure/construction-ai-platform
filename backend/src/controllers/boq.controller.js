const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get BOQ by project
exports.getBOQByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const boq = await prisma.bOQ.findFirst({
      where: { projectId },
      include: {
        items: {
          include: {
            lineItems: true
          },
          orderBy: { sortOrder: 'asc' }
        },
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
            lastName: true
          }
        }
      }
    });

    if (!boq) {
      // Return empty BOQ structure instead of 404
      return res.json({
        success: true,
        data: {
          boq: {
            projectId,
            items: [],
            totalEstimatedCost: 0
          }
        }
      });
    }

    res.json({
      success: true,
      data: { boq }
    });
  } catch (error) {
    logger.error('Get BOQ by project error:', error);
    next(error);
  }
};

// Create BOQ
exports.createBOQ = async (req, res, next) => {
  try {
    const { projectId, name, description } = req.body;

    // Check if BOQ already exists for project
    const existing = await prisma.bOQ.findFirst({
      where: { projectId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'BOQ already exists for this project'
      });
    }

    const boq = await prisma.bOQ.create({
      data: {
        projectId,
        name,
        description,
        createdBy: req.user.id
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`BOQ created for project ${projectId} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'BOQ created successfully',
      data: { boq }
    });
  } catch (error) {
    logger.error('Create BOQ error:', error);
    next(error);
  }
};

// Add BOQ item (category with line items)
exports.addBOQItem = async (req, res, next) => {
  try {
    const { boqId } = req.params;
    const {
      category,
      name,
      description,
      sortOrder,
      lineItems
    } = req.body;

    const item = await prisma.bOQItem.create({
      data: {
        boqId,
        category,
        name,
        description,
        sortOrder: sortOrder || 0,
        lineItems: lineItems ? {
          create: lineItems.map(li => ({
            description: li.description,
            unit: li.unit,
            quantity: parseFloat(li.quantity),
            rate: parseFloat(li.rate),
            notes: li.notes
          }))
        } : undefined
      },
      include: {
        lineItems: true
      }
    });

    // Update BOQ total
    await updateBOQTotal(boqId);

    logger.info(`BOQ item added to ${boqId} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'BOQ item added successfully',
      data: { item }
    });
  } catch (error) {
    logger.error('Add BOQ item error:', error);
    next(error);
  }
};

// Update BOQ item
exports.updateBOQItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { category, name, description, sortOrder } = req.body;

    const item = await prisma.bOQItem.update({
      where: { id: itemId },
      data: {
        category,
        name,
        description,
        sortOrder
      },
      include: {
        lineItems: true
      }
    });

    logger.info(`BOQ item updated: ${itemId} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'BOQ item updated successfully',
      data: { item }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'BOQ item not found'
      });
    }
    logger.error('Update BOQ item error:', error);
    next(error);
  }
};

// Delete BOQ item
exports.deleteBOQItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.bOQItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'BOQ item not found'
      });
    }

    await prisma.bOQItem.delete({
      where: { id: itemId }
    });

    // Update BOQ total
    await updateBOQTotal(item.boqId);

    logger.info(`BOQ item deleted: ${itemId} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'BOQ item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete BOQ item error:', error);
    next(error);
  }
};

// Add line item to BOQ item
exports.addLineItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { description, unit, quantity, rate, notes } = req.body;

    const lineItem = await prisma.bOQLineItem.create({
      data: {
        boqItemId: itemId,
        description,
        unit,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        notes
      }
    });

    // Get the boqId from the item
    const item = await prisma.bOQItem.findUnique({
      where: { id: itemId },
      select: { boqId: true }
    });

    // Update BOQ total
    await updateBOQTotal(item.boqId);

    logger.info(`Line item added to BOQ item ${itemId}`);

    res.status(201).json({
      success: true,
      message: 'Line item added successfully',
      data: { lineItem }
    });
  } catch (error) {
    logger.error('Add line item error:', error);
    next(error);
  }
};

// Update line item
exports.updateLineItem = async (req, res, next) => {
  try {
    const { lineItemId } = req.params;
    const { description, unit, quantity, rate, notes } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (unit !== undefined) updateData.unit = unit;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (rate !== undefined) updateData.rate = parseFloat(rate);
    if (notes !== undefined) updateData.notes = notes;

    const lineItem = await prisma.bOQLineItem.update({
      where: { id: lineItemId },
      data: updateData,
      include: {
        boqItem: {
          select: { boqId: true }
        }
      }
    });

    // Update BOQ total
    await updateBOQTotal(lineItem.boqItem.boqId);

    logger.info(`Line item updated: ${lineItemId}`);

    res.json({
      success: true,
      message: 'Line item updated successfully',
      data: { lineItem }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }
    logger.error('Update line item error:', error);
    next(error);
  }
};

// Delete line item
exports.deleteLineItem = async (req, res, next) => {
  try {
    const { lineItemId } = req.params;

    const lineItem = await prisma.bOQLineItem.findUnique({
      where: { id: lineItemId },
      include: {
        boqItem: {
          select: { boqId: true }
        }
      }
    });

    if (!lineItem) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    await prisma.bOQLineItem.delete({
      where: { id: lineItemId }
    });

    // Update BOQ total
    await updateBOQTotal(lineItem.boqItem.boqId);

    logger.info(`Line item deleted: ${lineItemId}`);

    res.json({
      success: true,
      message: 'Line item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete line item error:', error);
    next(error);
  }
};

// Helper function to update BOQ total
async function updateBOQTotal(boqId) {
  const items = await prisma.bOQItem.findMany({
    where: { boqId },
    include: {
      lineItems: true
    }
  });

  let totalEstimatedCost = 0;
  items.forEach(item => {
    item.lineItems.forEach(lineItem => {
      totalEstimatedCost += parseFloat(lineItem.quantity) * parseFloat(lineItem.rate);
    });
  });

  await prisma.bOQ.update({
    where: { id: boqId },
    data: { totalEstimatedCost }
  });
}
