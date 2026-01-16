const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  isSpoiler: {
    type: Boolean,
    default: false
  },
  spoilerFor: {
    episodeNumber: Number,
    season: String
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  helpful: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    comment: String,
    rating: Number,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  tags: [String]
}, {
  timestamps: true
});

// Compound index to ensure unique user-show review combinations
reviewSchema.index({ userId: 1, showId: 1 }, { unique: true });

// Index for search functionality
reviewSchema.index({ comment: 'text', title: 'text' });

// Virtual for helpful score
reviewSchema.virtual('helpfulScore').get(function() {
  return this.helpful.length - this.dislikes.length;
});

// Virtual for like ratio
reviewSchema.virtual('likeRatio').get(function() {
  const total = this.likes.length + this.dislikes.length;
  if (total === 0) return 0;
  return Math.round((this.likes.length / total) * 100);
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);
