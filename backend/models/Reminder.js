const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  nextEpisode: {
    episodeNumber: {
      type: Number,
      required: true
    },
    title: String,
    airDate: Date
  },
  alertTime: {
    type: Date,
    required: true
  },
  alertType: {
    type: String,
    enum: ['email', 'inApp', 'both'],
    default: 'both'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot be more than 200 characters'],
    default: 'New episode available!'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lastSent: Date,
  sentCount: {
    type: Number,
    default: 0
  },
  maxSends: {
    type: Number,
    default: 10
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for efficient querying
reminderSchema.index({ userId: 1, alertTime: 1 });
reminderSchema.index({ isActive: 1, alertTime: 1 });

// Virtual for time until alert
reminderSchema.virtual('timeUntilAlert').get(function() {
  if (!this.alertTime) return null;
  const now = new Date();
  const timeDiff = this.alertTime - now;
  return timeDiff > 0 ? timeDiff : 0;
});

// Virtual for alert status
reminderSchema.virtual('alertStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.alertTime) return 'no-date';
  
  const now = new Date();
  if (this.alertTime <= now) return 'overdue';
  if (this.alertTime - now <= 24 * 60 * 60 * 1000) return 'upcoming'; // within 24 hours
  return 'scheduled';
});

// Ensure virtual fields are serialized
reminderSchema.set('toJSON', { virtuals: true });
reminderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reminder', reminderSchema);
