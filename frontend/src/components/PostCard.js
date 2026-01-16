import React, { useState } from 'react';
import { FaUser, FaHeart, FaReply, FaEdit, FaTrash, FaEllipsisH } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ 
  post, 
  clubId, 
  isMember, 
  showSpoilers, 
  onAddComment, 
  onToggleLike, 
  onToggleSpoilers,
  onEditPost,
  onDeletePost,
  onDeleteComment,
  userRole
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: post.title,
    content: post.content,
    isSpoiler: post.isSpoiler
  });
  const [showMenu, setShowMenu] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!isMember) {
      toast.error('Please join the club to comment');
      return;
    }
    onAddComment(post._id, commentContent);
    setCommentContent('');
  };

  const handleEditPost = (e) => {
    e.preventDefault();
    onEditPost(post._id, editForm);
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDeletePost(post._id);
    }
    setShowMenu(false);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(post._id, commentId);
    }
  };

  const handleToggleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    if (!isMember) {
      toast.error('Please join the club to like posts');
      return;
    }
    onToggleLike(post._id);
  };

  const isLiked = post.likes?.some(like => like.userId === user?._id);
  const isSpoiler = post.isSpoiler && !showSpoilers;
  const isAuthor = post.author?._id === user?._id;
  const isAdminOrMod = userRole === 'admin' || userRole === 'moderator';
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdminOrMod;

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FaUser className="text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {post.author?.name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <span className="ml-2 text-xs">(edited)</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.isSpoiler && (
              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded-full">
                Spoiler
              </span>
            )}
            {canEdit || canDelete ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <FaEllipsisH />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDeletePost}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <FaTrash className="text-sm" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditPost} className="space-y-4">
            <div>
              <label htmlFor="editTitle" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="editTitle"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label htmlFor="editContent" className="form-label">
                Content
              </label>
              <textarea
                id="editContent"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="form-input"
                rows="6"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isSpoiler}
                  onChange={(e) => setEditForm({ ...editForm, isSpoiler: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Contains spoilers
                </span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ title: post.title, content: post.content, isSpoiler: post.isSpoiler });
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {post.title}
            </h3>

            {isSpoiler ? (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  This post contains spoilers
                </p>
                <button
                  onClick={onToggleSpoilers}
                  className="btn-outline text-sm"
                >
                  Click to reveal spoilers
                </button>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FaHeart className={isLiked ? 'fill-current' : ''} />
              <span>{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <FaReply />
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Comments ({post.comments?.length || 0})
            </h4>
            
                         {/* Comment Form */}
             {isMember && (
               <form onSubmit={handleSubmitComment} className="mb-4 flex gap-2">
                 <input
                   type="text"
                   value={commentContent}
                   onChange={(e) => setCommentContent(e.target.value)}
                   className="form-input flex-1"
                   placeholder="Add a comment..."
                   required
                 />
                 <button type="submit" className="btn-primary px-4">
                   Comment
                 </button>
               </form>
             )}

            <div className="space-y-3">
              {post.comments?.map((comment, index) => {
                const isCommentAuthor = comment.userId?._id === user?._id;
                const canDeleteComment = isCommentAuthor || isAdminOrMod;
                
                return (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-primary-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {comment.userId?.name || 'Unknown'}
                        </div>
                        {canDeleteComment && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Delete comment"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.content}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
