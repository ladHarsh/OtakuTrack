const Club = require('../models/Club');
const User = require('../models/User');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy === 'members') {
      sort = { 'members.length': -1 };
    } else if (req.query.sortBy === 'posts') {
      sort = { 'posts.length': -1 };
    } else if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { 'members.length': -1 }; // Default sort by member count
    }

    const clubs = await Club.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name avatar')
      .select('-posts -polls');

    const total = await Club.countDocuments(filter);

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
    console.error('Get clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single club by ID
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar')
      .populate('posts.author', 'name avatar')
      .populate('posts.comments.userId', 'name avatar')
      .populate('polls.createdBy', 'name avatar');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is member
    let isMember = false;
    let userRole = null;
    if (req.user) {
      // Check if user is the creator
      if (club.createdBy._id.toString() === req.user._id.toString()) {
        isMember = true;
        userRole = 'admin';
      } else {
        // Check if user is in members array
        const member = club.members.find(m => m.userId._id.toString() === req.user._id.toString());
        if (member) {
          isMember = true;
          userRole = member.role;
        }
      }
    }
    
    // Removed debug logging

    res.json({
      success: true,
      data: {
        ...club.toObject(),
        isMember,
        userRole
      }
    });
  } catch (error) {
    console.error('Get club by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private
const createClub = async (req, res) => {
  try {
    const { name, description, category, relatedShow, rules, tags } = req.body;

    // Check if club name already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'Club name already exists'
      });
    }

    // Create club
    const club = await Club.create({
      name,
      description,
      category,
      relatedShow,
      rules: rules || [],
      tags: tags || [],
      createdBy: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'admin'
      }]
    });

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedClub
    });
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is already a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this club'
      });
    }

    // Check if club is full
    if (club.members.length >= club.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Club is full'
      });
    }

    // Add user to club
    club.members.push({
      userId: req.user._id,
      role: 'member'
    });

    await club.save();

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar');

    res.json({
      success: true,
      data: populatedClub,
      message: 'Successfully joined club'
    });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private
const leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    const memberIndex = club.members.findIndex(m => m.userId.toString() === req.user._id.toString());
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this club'
      });
    }

    // Check if user is the creator (admin)
    if (club.members[memberIndex].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot leave club. Transfer ownership first.'
      });
    }

    // Remove user from club
    club.members.splice(memberIndex, 1);
    await club.save();

    res.json({
      success: true,
      message: 'Successfully left club'
    });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create post in club
// @route   POST /api/clubs/:id/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, isSpoiler, spoilerFor, tags } = req.body;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({
        success: false,
        message: 'Must be a member to post'
      });
    }

    // Clean and validate spoilerFor data
    let cleanSpoilerFor = {};
    if (spoilerFor && spoilerFor.showId && spoilerFor.showId.toString().trim() !== '') {
      // Validate that showId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(spoilerFor.showId)) {
        cleanSpoilerFor = {
          showId: spoilerFor.showId,
          episodeNumber: spoilerFor.episodeNumber || null
        };
      }
    }
    
    // Removed debug logging

    // Create post
    const post = {
      title,
      content,
      author: req.user._id,
      isSpoiler: isSpoiler || false,
      spoilerFor: cleanSpoilerFor,
      tags: tags || []
    };

    club.posts.push(post);
    await club.save();

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar')
      .populate('posts.author', 'name avatar')
      .populate('posts.comments.userId', 'name avatar');

    const newPost = populatedClub.posts[populatedClub.posts.length - 1];

    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create poll in club
// @route   POST /api/clubs/:id/polls
// @access  Private
const createPoll = async (req, res) => {
  try {
    const { question, options, endDate, isMultipleChoice } = req.body;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({
        success: false,
        message: 'Must be a member to create polls'
      });
    }

    // Create poll
    const poll = {
      question,
      options: options.map(option => ({ text: option })),
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user._id,
      isMultipleChoice: isMultipleChoice || false
    };

    club.polls.push(poll);
    await club.save();

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar')
      .populate('polls.createdBy', 'name avatar');

    const newPoll = populatedClub.polls[populatedClub.polls.length - 1];

    res.status(201).json({
      success: true,
      data: newPoll
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Vote on poll
// @route   POST /api/clubs/:clubId/polls/:pollId/vote
// @access  Private
const voteOnPoll = async (req, res) => {
  try {
    const { optionIndexes } = req.body; // Array of option indexes

    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const poll = club.polls.id(req.params.pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Poll is not active'
      });
    }

    // Check if user is a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({
        success: false,
        message: 'Must be a member to vote'
      });
    }

    // Remove previous votes by this user
    poll.options.forEach(option => {
      option.votes = option.votes.filter(vote => 
        vote.userId.toString() !== req.user._id.toString()
      );
    });

    // Add new votes
    if (Array.isArray(optionIndexes)) {
      optionIndexes.forEach(index => {
        if (index >= 0 && index < poll.options.length) {
          poll.options[index].votes.push({
            userId: req.user._id,
            timestamp: new Date()
          });
        }
      });
    }

    await club.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Vote on poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Admin only)
const updateClub = async (req, res) => {
  try {
    const { name, description, category, relatedShow, rules, tags, isPrivate, isSpoilerFree, maxMembers } = req.body;

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is admin of the club
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only club admins can update the club'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== club.name) {
      const existingClub = await Club.findOne({ name });
      if (existingClub) {
        return res.status(400).json({
          success: false,
          message: 'Club name already exists'
        });
      }
    }

    // Update club
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      {
        name: name || club.name,
        description: description || club.description,
        category: category || club.category,
        relatedShow: relatedShow || club.relatedShow,
        rules: rules || club.rules,
        tags: tags || club.tags,
        isPrivate: isPrivate !== undefined ? isPrivate : club.isPrivate,
        isSpoilerFree: isSpoilerFree !== undefined ? isSpoilerFree : club.isSpoilerFree,
        maxMembers: maxMembers || club.maxMembers
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar');

    res.json({
      success: true,
      data: updatedClub,
      message: 'Club updated successfully'
    });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Admin only)
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if user is admin of the club
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only club admins can delete the club'
      });
    }

    // Soft delete - set isActive to false
    club.isActive = false;
    await club.save();

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

// @desc    Add comment to post
// @route   POST /api/clubs/:clubId/posts/:postId/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const post = club.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({
        success: false,
        message: 'Must be a member to comment'
      });
    }

    // Add comment
    post.comments.push({
      userId: req.user._id,
      content,
      timestamp: new Date()
    });
    
    // Removed debug logging

    await club.save();

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar')
      .populate('posts.author', 'name avatar')
      .populate('posts.comments.userId', 'name avatar');

    const updatedPost = populatedClub.posts.id(req.params.postId);

    res.status(201).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/clubs/:clubId/posts/:postId/like
// @access  Private
const togglePostLike = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const post = club.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is a member
    const isMember = club.members.find(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(401).json({
        success: false,
        message: 'Must be a member to like posts'
      });
    }

    // Check if user already liked the post
    const existingLike = post.likes.find(like => like.userId.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.userId.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push({
        userId: req.user._id,
        timestamp: new Date()
      });
    }

    await club.save();

    res.json({
      success: true,
      data: {
        isLiked: !existingLike,
        likeCount: post.likes.length
      },
      message: existingLike ? 'Post unliked' : 'Post liked'
    });
  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete post from club
// @route   DELETE /api/clubs/:clubId/posts/:postId
// @access  Private (Post author or admin/moderator)
const deletePost = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const post = club.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the post author or admin/moderator
    const isAuthor = post.author.toString() === req.user._id.toString();
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    const isAdminOrMod = member && (member.role === 'admin' || member.role === 'moderator');

    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Remove post
    club.posts = club.posts.filter(p => p._id.toString() !== req.params.postId);
    await club.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Edit post in club
// @route   PUT /api/clubs/:clubId/posts/:postId
// @access  Private (Post author only)
const editPost = async (req, res) => {
  try {
    const { title, content, isSpoiler, spoilerFor, tags } = req.body;

    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const post = club.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the post author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this post'
      });
    }

    // Update post
    post.title = title || post.title;
    post.content = content || post.content;
    post.isSpoiler = isSpoiler !== undefined ? isSpoiler : post.isSpoiler;
    post.spoilerFor = spoilerFor || post.spoilerFor;
    post.tags = tags || post.tags;
    post.updatedAt = new Date();

    await club.save();

    const populatedClub = await Club.findById(club._id)
      .populate('createdBy', 'name avatar')
      .populate('members.userId', 'name avatar')
      .populate('posts.author', 'name avatar')
      .populate('posts.comments.userId', 'name avatar');

    const updatedPost = populatedClub.posts.id(req.params.postId);

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete poll from club
// @route   DELETE /api/clubs/:clubId/polls/:pollId
// @access  Private (Poll creator or admin/moderator)
const deletePoll = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const poll = club.polls.id(req.params.pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user is the poll creator or admin/moderator
    const isCreator = poll.createdBy.toString() === req.user._id.toString();
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    const isAdminOrMod = member && (member.role === 'admin' || member.role === 'moderator');

    if (!isCreator && !isAdminOrMod) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this poll'
      });
    }

    // Remove poll
    club.polls = club.polls.filter(p => p._id.toString() !== req.params.pollId);
    await club.save();

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/clubs/:clubId/posts/:postId/comments/:commentId
// @access  Private (Comment author or admin/moderator)
const deleteComment = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const post = club.posts.id(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the comment author or admin/moderator
    const isAuthor = comment.userId.toString() === req.user._id.toString();
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    const isAdminOrMod = member && (member.role === 'admin' || member.role === 'moderator');

    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    await club.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get posts with pagination and filtering
// @route   GET /api/clubs/:id/posts
// @access  Public
const getClubPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const club = await Club.findById(req.params.id)
      .populate('posts.author', 'name avatar')
      .populate('posts.comments.userId', 'name avatar');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    let posts = club.posts;

    // Filter by spoiler content if club is spoiler-free
    if (club.isSpoilerFree && req.query.hideSpoilers === 'true') {
      posts = posts.filter(post => !post.isSpoiler);
    }

    // Sort posts (newest first by default)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = posts.length;
    const paginatedPosts = posts.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get club posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get polls with pagination
// @route   GET /api/clubs/:id/polls
// @access  Public
const getClubPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const club = await Club.findById(req.params.id)
      .populate('polls.createdBy', 'name avatar');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    let polls = club.polls;

    // Filter by active status if requested
    if (req.query.active === 'true') {
      polls = polls.filter(poll => poll.isActive);
    }

    // Sort polls (newest first by default)
    polls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const total = polls.length;
    const paginatedPolls = polls.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedPolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get club polls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get poll results with detailed statistics
// @route   GET /api/clubs/:clubId/polls/:pollId/results
// @access  Public
const getPollResults = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const poll = club.polls.id(req.params.pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Calculate detailed statistics
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
    const uniqueVoters = new Set();
    const optionStats = poll.options.map((option, index) => {
      option.votes.forEach(vote => uniqueVoters.add(vote.userId.toString()));
      const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
      return {
        index,
        text: option.text,
        votes: option.votes.length,
        percentage: Math.round(percentage * 100) / 100,
        voters: option.votes.map(vote => vote.userId)
      };
    });

    // Check if current user has voted
    let userVote = null;
    if (req.user) {
      poll.options.forEach((option, index) => {
        if (option.votes.some(vote => vote.userId.toString() === req.user._id.toString())) {
          userVote = index;
        }
      });
    }

    res.json({
      success: true,
      data: {
        poll: {
          _id: poll._id,
          question: poll.question,
          isActive: poll.isActive,
          isMultipleChoice: poll.isMultipleChoice,
          endDate: poll.endDate,
          createdAt: poll.createdAt,
          createdBy: poll.createdBy
        },
        statistics: {
          totalVotes,
          uniqueVoters: uniqueVoters.size,
          options: optionStats
        },
        userVote
      }
    });
  } catch (error) {
    console.error('Get poll results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Close poll manually
// @route   PUT /api/clubs/:clubId/polls/:pollId/close
// @access  Private (Poll creator or admin/moderator)
const closePoll = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const poll = club.polls.id(req.params.pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if user is the poll creator or admin/moderator
    const isCreator = poll.createdBy.toString() === req.user._id.toString();
    const member = club.members.find(m => m.userId.toString() === req.user._id.toString());
    const isAdminOrMod = member && (member.role === 'admin' || member.role === 'moderator');

    if (!isCreator && !isAdminOrMod) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this poll'
      });
    }

    // Close the poll
    poll.isActive = false;
    await club.save();

    res.json({
      success: true,
      message: 'Poll closed successfully'
    });
  } catch (error) {
    console.error('Close poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  createPost,
  createPoll,
  voteOnPoll,
  addComment,
  togglePostLike,
  deletePost,
  editPost,
  deletePoll,
  deleteComment,
  getClubPosts,
  getClubPolls,
  getPollResults,
  closePoll
};
