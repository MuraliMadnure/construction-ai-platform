const prisma = require('../utils/prisma');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');


// Upload single file
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { folder = 'general', projectId } = req.body;

    // Save file metadata to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        folder,
        uploadedBy: req.user.id,
        projectId: projectId || null
      }
    });

    logger.info(`File uploaded: ${req.file.originalname} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
          mimeType: fileUpload.mimeType,
          size: fileUpload.size,
          url: `/uploads/${folder}/${req.file.filename}`
        }
      }
    });
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Error deleting file:', err);
      });
    }
    logger.error('Upload file error:', error);
    next(error);
  }
};

// Upload multiple files
exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder = 'general', projectId } = req.body;

    // Save all files to database
    const fileUploads = await Promise.all(
      req.files.map((file) =>
        prisma.fileUpload.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            folder,
            uploadedBy: req.user.id,
            projectId: projectId || null
          }
        })
      )
    );

    logger.info(`${req.files.length} files uploaded by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: fileUploads.map((file) => ({
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: `/uploads/${folder}/${file.filename}`
        }))
      }
    });
  } catch (error) {
    // Clean up uploaded files if database save fails
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) logger.error('Error deleting file:', err);
        });
      });
    }
    logger.error('Upload multiple files error:', error);
    next(error);
  }
};

// Delete file
exports.deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.fileUpload.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user has permission to delete
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (file.uploadedBy !== req.user.id && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this file'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id }
    });

    logger.info(`File deleted: ${file.originalName} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Delete file error:', error);
    next(error);
  }
};

// Get file by ID
exports.getFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await prisma.fileUpload.findUnique({
      where: { id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Authorization: user must be uploader, admin, or project member
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (file.uploadedBy !== req.user.id && !isAdmin) {
      if (file.projectId) {
        const membership = await prisma.projectMember.findFirst({
          where: { projectId: file.projectId, userId: req.user.id }
        });
        if (!membership) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this file'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this file'
        });
      }
    }

    res.json({
      success: true,
      data: { file }
    });
  } catch (error) {
    logger.error('Get file error:', error);
    next(error);
  }
};

// Get files by project
exports.getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Authorization: user must be admin or project member
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    if (!isAdmin) {
      const membership = await prisma.projectMember.findFirst({
        where: { projectId, userId: req.user.id }
      });
      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project\'s files'
        });
      }
    }

    const files = await prisma.fileUpload.findMany({
      where: { projectId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { files }
    });
  } catch (error) {
    logger.error('Get project files error:', error);
    next(error);
  }
};
