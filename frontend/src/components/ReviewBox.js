import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { FaStar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import reviewApi from '../api/reviewApi';
import toast from 'react-hot-toast';

const ReviewBox = ({ showId, review, onReviewSubmit, onCancel }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(review?.rating ? Math.round(review.rating / 2) : 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [isEditing, setIsEditing] = useState(!review);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (review) {
      setRating(review.rating ? Math.round(review.rating / 2) : 0);
      setComment(review.comment || '');
      setIsEditing(false);
    }
  }, [review]);

  // Create review mutation
  const createReviewMutation = useMutation(
    (data) => reviewApi.addReview(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', showId]);
        toast.success('Review submitted successfully!');
        setComment('');
        setRating(0);
        setIsEditing(false);
        if (onReviewSubmit) onReviewSubmit();
      },
      onError: (error) => {
        console.error('Create review error:', error);
        console.error('Error response:', error.response?.data);
        
        // Handle duplicate review error specifically
        if (error.response?.data?.message === 'You have already reviewed this show') {
          toast.error('You have already reviewed this show. You can edit your existing review.');
          // Refresh the user's review data to show the existing review
          queryClient.invalidateQueries(['user-reviews']);
        } else {
          toast.error(error.response?.data?.message || error.message || 'Failed to submit review');
        }
      }
    }
  );

  // Update review mutation
  const updateReviewMutation = useMutation(
    (data) => reviewApi.updateReview(review._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', showId]);
        toast.success('Review updated successfully!');
        setIsEditing(false);
        if (onReviewSubmit) onReviewSubmit();
      },
      onError: (error) => {
        console.error('Update review error:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || error.message || 'Failed to update review');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (comment.trim().length > 2000) {
      toast.error('Comment cannot be more than 2000 characters');
      return;
    }

    const reviewData = {
      showId: showId.toString(), // Ensure showId is a string
      rating: rating * 2, // Convert 1-5 scale to 1-10 scale
      comment: comment.trim()
    };

    // Debug logging removed

    if (review) {
      updateReviewMutation.mutate(reviewData);
    } else {
      createReviewMutation.mutate(reviewData);
    }
  };

  const handleCancel = () => {
    if (review) {
      setIsEditing(false);
      setRating(review.rating ? Math.round(review.rating / 2) : 0);
      setComment(review.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    if (onCancel) onCancel();
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  // Debug logging removed
  
  if (!isEditing && review) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your Review
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < (rating / 2) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(rating / 2)}/5
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {comment}
          </p>

          <div className="flex justify-end">
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-ghost text-sm"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {review ? 'Edit Review' : 'Write a Review'}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="form-label">Rating</label>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRatingChange(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors duration-200"
                >
                  <FaStar
                    className={`w-6 h-6 ${
                      i < (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="form-label">
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input"
              rows="4"
              placeholder="Share your thoughts about this show..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={createReviewMutation.isLoading || updateReviewMutation.isLoading}
            >
              <FaSave className="mr-2" />
              {createReviewMutation.isLoading || updateReviewMutation.isLoading
                ? 'Saving...'
                : review
                ? 'Update Review'
                : 'Submit Review'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewBox;
