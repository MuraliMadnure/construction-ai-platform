const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');
const router = express.Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
}));
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: 'Created successfully' });
}));
module.exports = router;
