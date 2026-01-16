const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  status: {
    type: String,
    required: true,
    enum: ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'],
    default: 'Plan to Watch'
  },
  progress: {
    currentEpisode: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEpisodes: {
      type: Number,
      default: 0
    },
    rewatchCount: {
      type: Number,
      default: 0
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  finishDate: Date,
  lastWatched: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Compound index to ensure unique user-show combinations
watchlistSchema.index({ userId: 1, showId: 1 }, { unique: true });

// Virtual for completion percentage
watchlistSchema.virtual('completionPercentage').get(function() {
  if (this.progress.totalEpisodes === 0) return 0;
  return Math.round((this.progress.currentEpisode / this.progress.totalEpisodes) * 100);
});

// Virtual for time spent watching
watchlistSchema.virtual('timeSpent').get(function() {
  if (!this.startDate || !this.finishDate) return 0;
  const timeDiff = this.finishDate - this.startDate;
  return Math.round(timeDiff / (1000 * 60 * 60 * 24)); // days
});

// Ensure virtual fields are serialized
watchlistSchema.set('toJSON', { virtuals: true });
watchlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
