const Show = require('../models/Show');
const Watchlist = require('../models/Watchlist');

class RecommendationEngine {
  // Get personalized recommendations based on user's watch history
  static async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      // Get user's watch history
      const userWatchlist = await Watchlist.find({ 
        userId, 
        status: { $in: ['Watching', 'Completed'] } 
      }).populate('showId');

      if (userWatchlist.length === 0) {
        // If no watch history, return popular shows
        return await this.getPopularShows(limit);
      }

      // Extract genres and tags from watched shows
      const watchedGenres = new Set();
      const watchedTags = new Set();
      const genreScores = {};
      const tagScores = {};

      userWatchlist.forEach(item => {
        if (item.showId && item.showId.genres) {
          item.showId.genres.forEach(genre => {
            watchedGenres.add(genre);
            genreScores[genre] = (genreScores[genre] || 0) + 1;
          });
        }
        if (item.showId && item.showId.tags) {
          item.showId.tags.forEach(tag => {
            watchedTags.add(tag);
            tagScores[tag] = (tagScores[tag] || 0) + 1;
          });
        }
      });

      // Get shows that match user preferences
      const recommendations = await Show.find({
        _id: { $nin: userWatchlist.map(item => item.showId._id) }
        // Removed isActive filter
      }).populate('rating');

      // Score each show based on user preferences
      const scoredShows = recommendations.map(show => {
        let score = 0;
        
        // Genre matching score
        if (show.genres) {
          show.genres.forEach(genre => {
            if (genreScores[genre]) {
              score += genreScores[genre] * 2; // Higher weight for genres
            }
          });
        }

        // Tag matching score
        if (show.tags) {
          show.tags.forEach(tag => {
            if (tagScores[tag]) {
              score += tagScores[tag];
            }
          });
        }

        // Rating boost
        if (show.rating && show.rating.average) {
          score += show.rating.average * 0.5;
        }

        // Popularity boost
        if (show.isPopular) {
          score += 3;
        }

        // New shows boost
        const currentYear = new Date().getFullYear();
        if (show.year && show.year >= currentYear - 2) {
          score += 2;
        }

        return { show, score };
      });

      // Sort by score and return top recommendations
      return scoredShows
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.show);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return await this.getPopularShows(limit);
    }
  }

  // Get shows based on specific genre
  static async getShowsByGenre(genre, limit = 20) {
    try {
      return await Show.find({
        genres: genre
        // Removed isActive filter
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit);
    } catch (error) {
      console.error('Error getting shows by genre:', error);
      return [];
    }
  }

  // Get shows based on specific tags
  static async getShowsByTags(tags, limit = 20) {
    try {
      return await Show.find({
        tags: { $in: tags }
        // Removed isActive filter
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit);
    } catch (error) {
      console.error('Error getting shows by tags:', error);
      return [];
    }
  }

  // Get popular shows
  static async getPopularShows(limit = 20) {
    try {
      return await Show.find({})
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting popular shows:', error);
      return [];
    }
  }

  // Get trending shows (recently added with good ratings)
  static async getTrendingShows(limit = 20) {
    try {
      return await Show.find({
        'rating.average': { $gte: 7 }
      })
      .sort({ 'rating.average': -1 })
      .limit(limit);
    } catch (error) {
      console.error('Error getting trending shows:', error);
      return [];
    }
  }

  // Get similar shows based on a specific show
  static async getSimilarShows(showId, limit = 10) {
    try {
      const show = await Show.findById(showId);
      if (!show) return [];

      const similarShows = await Show.find({
        _id: { $ne: showId },
        // Removed isActive filter
        $or: [
          { genres: { $in: show.genres } },
          { tags: { $in: show.tags } }
        ]
      })
      .sort({ 'rating.average': -1 })
      .limit(limit);

      return similarShows;
    } catch (error) {
      console.error('Error getting similar shows:', error);
      return [];
    }
  }

  // Get seasonal recommendations
  static async getSeasonalRecommendations(season, year, limit = 20) {
    try {
      return await Show.find({
        season: season,
        year: year
        // Removed isActive filter
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit);
    } catch (error) {
      console.error('Error getting seasonal recommendations:', error);
      return [];
    }
  }
}

module.exports = RecommendationEngine;
