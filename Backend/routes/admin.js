const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Simple admin panel info endpoint
// @route   GET /api/admin/panel
// @access  Private (admin only)
router.get('/panel', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the admin panel',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
