const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: Number, // in minutes
  airDate: Date,
  thumbnail: String
});

const streamingLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['Crunchyroll', 'Funimation', 'Netflix', 'Hulu', 'Amazon Prime', 'HIDIVE', 'VRV', 'Other']
  },
  url: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: 'Global'
  }
});

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  originalTitle: String,
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['TV', 'Movie', 'OVA', 'Special', 'ONA']
  },
  status: {
    type: String,
    required: true,
    enum: ['Ongoing', 'Completed', 'Upcoming', 'Hiatus', 'Cancelled']
  },
  genres: [{
    type: String,
    required: true,
    enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Sports', 'Supernatural', 'Psychological', 'Historical', 'Military', 'Parody', 'School', 'Seinen', 'Shoujo', 'Shounen', 'Josei']
  }],
  tags: [String],
  episodes: [episodeSchema],
  totalEpisodes: {
    type: Number,
    default: 0
  },
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 10
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    count: {
      type: Number,
      default: 0
    }
  },
  streamingLinks: [streamingLinkSchema],
  poster: {
    type: String,
    required: true
  },
  banner: String,
  trailer: String,
  studio: String,
  source: {
    type: String,
    enum: ['Manga', 'Light Novel', 'Original', 'Visual Novel', 'Game', 'Other']
  },
  ageRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'R+', 'Unknown']
  },
  duration: {
    type: Number, // in minutes
    default: 24
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
showSchema.index({ title: 'text', description: 'text', genres: 'text', tags: 'text' });

// Virtual for episode count
showSchema.virtual('episodeCount').get(function() {
  return Array.isArray(this.episodes) ? this.episodes.length : 0;
});

// Virtual for streaming links count
showSchema.virtual('streamingLinksCount').get(function() {
  return Array.isArray(this.streamingLinks) ? this.streamingLinks.length : 0;
});

// Virtual for tags count
showSchema.virtual('tagsCount').get(function() {
  return Array.isArray(this.tags) ? this.tags.length : 0;
});

// Virtual for genres count
showSchema.virtual('genresCount').get(function() {
  return Array.isArray(this.genres) ? this.genres.length : 0;
});

// Ensure virtual fields are serialized
showSchema.set('toJSON', { virtuals: true });
showSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Show', showSchema);
