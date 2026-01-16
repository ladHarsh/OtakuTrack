const mongoose = require('mongoose');
const Club = require('./models/Club');
const User = require('./models/User');
require('dotenv').config();

// Sample club data
const sampleClubs = [
  {
    name: "Anime Enthusiasts",
    description: "A general community for all anime lovers to discuss their favorite shows, share recommendations, and connect with fellow fans.",
    category: "General",
    rules: [
      "Be respectful to all members",
      "No spoilers without proper tags",
      "Keep discussions anime-related",
      "No hate speech or bullying"
    ],
    tags: ["anime", "community", "discussion", "general"],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 1000
  },
  {
    name: "Action Anime Lovers",
    description: "Dedicated to action-packed anime series and movies. From shounen battles to mecha fights, we love it all!",
    category: "Genre",
    rules: [
      "Focus on action anime content",
      "Tag spoilers for ongoing series",
      "Share your favorite action scenes",
      "Recommend new action anime"
    ],
    tags: ["action", "shounen", "battle", "mecha", "fighting"],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 500
  },
  {
    name: "Romance Anime Club",
    description: "For fans of romance, slice of life, and emotional anime. Share your favorite couples and heartwarming moments.",
    category: "Genre",
    rules: [
      "Keep it wholesome and respectful",
      "No explicit content",
      "Share your favorite romantic moments",
      "Be supportive of all relationship types"
    ],
    tags: ["romance", "slice-of-life", "emotional", "couples", "love"],
    isPrivate: false,
    isSpoilerFree: true,
    maxMembers: 300
  },
  {
    name: "Attack on Titan Fans",
    description: "Dedicated community for discussing everything about Attack on Titan. Share theories, discuss episodes, and connect with fellow scouts.",
    category: "Show",
    rules: [
      "Tag all spoilers properly",
      "Respect different opinions",
      "No manga spoilers in anime discussions",
      "Share your theories and analysis"
    ],
    tags: ["attack-on-titan", "shingeki-no-kyojin", "titans", "scouts", "eren"],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 800
  },
  {
    name: "Seasonal Anime Watchers",
    description: "Discussing the latest seasonal anime releases. From spring to winter, we cover all the new shows each season.",
    category: "Seasonal",
    rules: [
      "Focus on current seasonal anime",
      "Tag spoilers for ongoing series",
      "Share your seasonal favorites",
      "Discuss episode reactions"
    ],
    tags: ["seasonal", "new-releases", "current", "episodes", "reactions"],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 600
  },
  {
    name: "Anime Art & Cosplay",
    description: "Showcase your anime-inspired artwork, cosplay photos, and creative projects. All skill levels welcome!",
    category: "Fan Art",
    rules: [
      "Original artwork only",
      "Credit original artists when sharing",
      "Be constructive with feedback",
      "No explicit or inappropriate content"
    ],
    tags: ["art", "cosplay", "creative", "fanart", "drawing"],
    isPrivate: false,
    isSpoilerFree: true,
    maxMembers: 400
  },
  {
    name: "Gaming & Anime",
    description: "For gamers who love anime and anime fans who love gaming. Discuss anime games, gaming culture, and crossover content.",
    category: "Gaming",
    rules: [
      "Keep discussions gaming and anime related",
      "Share your favorite anime games",
      "No console wars",
      "Be respectful of different gaming preferences"
    ],
    tags: ["gaming", "anime-games", "video-games", "gaming-culture", "crossover"],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 350
  }
];

// Sample posts data
const samplePosts = [
  {
    title: "What's your favorite anime of all time?",
    content: "I'm curious to know what anime holds a special place in your heart. For me, it's definitely Fullmetal Alchemist: Brotherhood. The story, characters, and themes just resonate with me so much. What about you?",
    isSpoiler: false,
    tags: ["discussion", "favorites", "recommendations"]
  },
  {
    title: "Just finished Demon Slayer Season 2 - WOW!",
    content: "The animation quality is absolutely insane! The Entertainment District arc was everything I hoped for and more. Tanjiro's growth as a character is incredible to watch.",
    isSpoiler: true,
    spoilerFor: { showId: null, episodeNumber: null },
    tags: ["demon-slayer", "season-2", "animation", "character-development"]
  },
  {
    title: "Anime recommendations for beginners?",
    content: "My friend just got into anime and asked me for recommendations. I suggested Death Note and My Hero Academia as good starting points. What other shows would you recommend for someone new to anime?",
    isSpoiler: false,
    tags: ["recommendations", "beginners", "introduction"]
  },
  {
    title: "The evolution of anime art styles",
    content: "It's fascinating to see how anime art styles have evolved over the decades. From the classic 80s style to modern digital animation, each era has its unique charm. What's your favorite art style period?",
    isSpoiler: false,
    tags: ["art-style", "evolution", "animation", "history"]
  },
  {
    title: "Best anime soundtracks?",
    content: "Music can make or break an anime experience. Some of my favorites include Attack on Titan's epic orchestral pieces and Your Name's beautiful piano compositions. What anime soundtracks do you love?",
    isSpoiler: false,
    tags: ["soundtrack", "music", "orchestral", "piano"]
  }
];

// Sample polls data
const samplePolls = [
  {
    question: "What's your favorite anime genre?",
    options: ["Action/Adventure", "Romance/Slice of Life", "Comedy", "Drama", "Sci-Fi/Fantasy", "Horror/Thriller"],
    isMultipleChoice: false,
    endDate: null
  },
  {
    question: "Which anime season do you prefer?",
    options: ["Spring", "Summer", "Fall", "Winter"],
    isMultipleChoice: false,
    endDate: null
  },
  {
    question: "What's your preferred way to watch anime?",
    options: ["Subbed", "Dubbed", "Both", "Depends on the show"],
    isMultipleChoice: false,
    endDate: null
  },
  {
    question: "Select all the anime you've watched this month",
    options: ["Demon Slayer", "Jujutsu Kaisen", "One Piece", "My Hero Academia", "Attack on Titan", "None of the above"],
    isMultipleChoice: true,
    endDate: null
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample users if they don't exist
const createSampleUsers = async () => {
  const users = [];
  
  // Check if sample users exist
  let adminUser = await User.findOne({ email: 'admin@example.com' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Created admin user');
  }
  users.push(adminUser);

  // Create additional sample users
  const sampleUserData = [
    { name: 'Anime Fan 1', email: 'fan1@example.com', password: 'password123' },
    { name: 'Anime Fan 2', email: 'fan2@example.com', password: 'password123' },
    { name: 'Anime Fan 3', email: 'fan3@example.com', password: 'password123' },
    { name: 'Anime Fan 4', email: 'fan4@example.com', password: 'password123' },
    { name: 'Anime Fan 5', email: 'fan5@example.com', password: 'password123' }
  ];

  for (const userData of sampleUserData) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
      console.log(`Created user: ${user.name}`);
    }
    users.push(user);
  }

  return users;
};

// Create clubs with sample data
const createClubs = async (users) => {
  const createdClubs = [];
  
  for (let i = 0; i < sampleClubs.length; i++) {
    const clubData = sampleClubs[i];
    const creator = users[i % users.length];
    
    // Check if club already exists
    let club = await Club.findOne({ name: clubData.name });
    if (!club) {
      // Create club
      club = await Club.create({
        ...clubData,
        createdBy: creator._id,
        members: [{
          userId: creator._id,
          role: 'admin'
        }]
      });
      console.log(`Created club: ${club.name}`);
    }
    
    // Add some members to each club
    for (let j = 0; j < Math.min(users.length, 3); j++) {
      const member = users[j];
      if (!club.members.find(m => m.userId.toString() === member._id.toString())) {
        club.members.push({
          userId: member._id,
          role: j === 0 ? 'admin' : 'member'
        });
      }
    }
    
    // Add sample posts
    if (club.posts.length === 0) {
      const postCount = Math.floor(Math.random() * 3) + 2; // 2-4 posts per club
      for (let k = 0; k < postCount; k++) {
        const postData = samplePosts[Math.floor(Math.random() * samplePosts.length)];
        const postAuthor = users[Math.floor(Math.random() * users.length)];
        
        const post = {
          ...postData,
          author: postAuthor._id,
          likes: [],
          comments: []
        };
        
        // Add some likes
        const likeCount = Math.floor(Math.random() * 5);
        for (let l = 0; l < likeCount; l++) {
          const liker = users[Math.floor(Math.random() * users.length)];
          if (!post.likes.find(like => like.userId.toString() === liker._id.toString())) {
            post.likes.push({
              userId: liker._id,
              timestamp: new Date()
            });
          }
        }
        
        // Add some comments
        const commentCount = Math.floor(Math.random() * 3);
        for (let m = 0; m < commentCount; m++) {
          const commenter = users[Math.floor(Math.random() * users.length)];
          post.comments.push({
            userId: commenter._id,
            content: `Great post! I totally agree with your thoughts on this.`,
            timestamp: new Date()
          });
        }
        
        club.posts.push(post);
      }
    }
    
    // Add sample polls
    if (club.polls.length === 0) {
      const pollCount = Math.floor(Math.random() * 2) + 1; // 1-2 polls per club
      for (let n = 0; n < pollCount; n++) {
        const pollData = samplePolls[Math.floor(Math.random() * samplePolls.length)];
        const pollCreator = users[Math.floor(Math.random() * users.length)];
        
        const poll = {
          ...pollData,
          createdBy: pollCreator._id,
          options: pollData.options.map(option => ({
            text: option,
            votes: []
          }))
        };
        
        // Add some votes
        const voterCount = Math.floor(Math.random() * 8) + 2;
        for (let o = 0; o < voterCount; o++) {
          const voter = users[Math.floor(Math.random() * users.length)];
          const optionIndex = Math.floor(Math.random() * poll.options.length);
          
          if (!poll.options[optionIndex].votes.find(vote => vote.userId.toString() === voter._id.toString())) {
            poll.options[optionIndex].votes.push({
              userId: voter._id,
              timestamp: new Date()
            });
          }
        }
        
        club.polls.push(poll);
      }
    }
    
    await club.save();
    createdClubs.push(club);
  }
  
  return createdClubs;
};

// Main seeding function
const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Starting to seed club data...');
    
    // Create sample users
    const users = await createSampleUsers();
    console.log(`Created/Found ${users.length} users`);
    
    // Create clubs with sample data
    const clubs = await createClubs(users);
    console.log(`Created/Updated ${clubs.length} clubs`);
    
    console.log('Club seeding completed successfully!');
    console.log('\nSample Data Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Clubs: ${clubs.length}`);
    console.log(`- Total Posts: ${clubs.reduce((sum, club) => sum + club.posts.length, 0)}`);
    console.log(`- Total Polls: ${clubs.reduce((sum, club) => sum + club.polls.length, 0)}`);
    console.log(`- Total Members: ${clubs.reduce((sum, club) => sum + club.members.length, 0)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
