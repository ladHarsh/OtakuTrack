const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: [200, 'Question cannot be more than 200 characters']
  },
  options: [pollOptionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  endDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isMultipleChoice: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isSpoiler: {
    type: Boolean,
    default: false
  },
  spoilerFor: {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      default: null
    },
    episodeNumber: {
      type: Number,
      default: null
    }
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
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String]
}, {
  timestamps: true
});

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    maxlength: [100, 'Club name cannot be more than 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: String,
  category: {
    type: String,
    required: true,
    enum: ['General', 'Genre', 'Show', 'Seasonal', 'Discussion', 'Fan Art', 'Cosplay', 'Gaming', 'Other']
  },
  relatedShow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show'
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  posts: [postSchema],
  polls: [pollSchema],
  rules: [String],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isSpoilerFree: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 1000
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
clubSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for member count
clubSchema.virtual('memberCount').get(function () {
  return Array.isArray(this.members) ? this.members.length : 0;
});

clubSchema.virtual('postCount').get(function () {
  return Array.isArray(this.posts) ? this.posts.length : 0;
});


// Ensure virtual fields are serialized
clubSchema.set('toJSON', { virtuals: true });
clubSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Club', clubSchema);
