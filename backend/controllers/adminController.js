const User = require('../models/User');
const Club = require('../models/Club');
const Review = require('../models/Review');
const Show = require('../models/Show');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'moderator', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User banned successfully'
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
// @access  Private/Admin
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get flagged content
// @route   GET /api/admin/flagged
// @access  Private/Admin
const getFlaggedContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get flagged reviews
    const flaggedReviews = await Review.find({ isReported: true })
      .populate('userId', 'name email')
      .populate('showId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ isReported: true });

    res.json({
      success: true,
      data: {
        reviews: flaggedReviews
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove flagged review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const removeFlaggedReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (!review.isReported) {
      return res.status(400).json({
        success: false,
        message: 'Review is not flagged'
      });
    }

    const showId = review.showId;
    await Review.findByIdAndDelete(req.params.id);

    // Update show rating
    await updateShowRating(showId);

    res.json({
      success: true,
      message: 'Flagged review removed successfully'
    });
  } catch (error) {
    console.error('Remove flagged review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all clubs (admin view)
// @route   GET /api/admin/clubs
// @access  Private/Admin
const getAllClubs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const clubs = await Club.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Club.countDocuments();

    res.json({
      success: true,
      data: clubs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update club status
// @route   PUT /api/admin/clubs/:id/status
// @access  Private/Admin
const updateClubStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      data: club
    });
  } catch (error) {
    console.error('Update club status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve club
// @route   PUT /api/admin/clubs/:id/approve
// @access  Private/Admin
const approveClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      data: club,
      message: 'Club approved successfully'
    });
  } catch (error) {
    console.error('Approve club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject club
// @route   PUT /api/admin/clubs/:id/reject
// @access  Private/Admin
const rejectClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      data: club,
      message: 'Club rejected successfully'
    });
  } catch (error) {
    console.error('Reject club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete club
// @route   DELETE /api/admin/clubs/:id
// @access  Private/Admin
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments();
    const activeShows = await Show.countDocuments({ isActive: true });
    const totalClubs = await Club.countDocuments();
    const activeClubs = await Club.countDocuments({ isActive: true });
    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ isReported: true });

    // Get user growth over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get top genres
    const genreStats = await Show.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsers
        },
        shows: {
          total: totalShows,
          active: activeShows
        },
        clubs: {
          total: totalClubs,
          active: activeClubs
        },
        reviews: {
          total: totalReviews,
          flagged: flaggedReviews
        },
        topGenres: genreStats,
        systemStatus: 'healthy',
        uptime: '99.9%',
        activeSessions: activeUsers // simple proxy
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // This would normally fetch from a logging system
    // For now, we'll return a mock response
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'System startup',
        user: 'system'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        level: 'info',
        message: 'User login: admin@otakutrack.com',
        user: 'admin@otakutrack.com'
      }
    ];

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: logs.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export users data
// @route   GET /api/admin/export/users
// @access  Private/Admin
const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    
    // Convert to CSV format
    const csvHeader = 'Name,Email,Role,Status,Created At\n';
    const csvRows = users.map(user => 
      `"${user.name}","${user.email}","${user.role}","${user.isActive ? 'Active' : 'Inactive'}","${user.createdAt}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export clubs data
// @route   GET /api/admin/export/clubs
// @access  Private/Admin
const exportClubs = async (req, res) => {
  try {
    const clubs = await Club.find().populate('createdBy', 'name email').lean();
    
    // Convert to CSV format
    const csvHeader = 'Name,Description,Owner,Members,Status,Created At\n';
    const csvRows = clubs.map(club => 
      `"${club.name}","${club.description}","${club.createdBy?.name || 'Unknown'}","${club.members?.length || 0}","${club.isActive ? 'Active' : 'Inactive'}","${club.createdAt}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clubs-export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to update show rating
const updateShowRating = async (showId) => {
  try {
    const reviews = await Review.find({ showId });
    
    if (reviews.length === 0) {
      await Show.findByIdAndUpdate(showId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Show.findByIdAndUpdate(showId, {
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': reviews.length
    });
  } catch (error) {
    console.error('Update show rating error:', error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  banUser,
  unbanUser,
  deleteUser,
  getFlaggedContent,
  removeFlaggedReview,
  getAllClubs,
  updateClubStatus,
  approveClub,
  rejectClub,
  deleteClub,
  getAdminStats,
  getSystemLogs,
  exportUsers,
  exportClubs
};
