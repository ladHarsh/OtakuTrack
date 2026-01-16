const Club = require('../models/Club');
const User = require('../models/User');

const seedClubs = async () => {
  try {
    // Get some users for seeding
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }

    // Sample club data
    const clubsData = [
      {
        name: 'Attack on Titan Fans',
        description: 'A community for discussing the epic anime series Attack on Titan. Share theories, fan art, and discuss the latest episodes!',
        category: 'Show',
        relatedShow: null, // You can add actual show IDs here
        rules: [
          'No spoilers in titles',
          'Be respectful to other fans',
          'Tag spoilers appropriately',
          'No hate speech or harassment'
        ],
        tags: ['attack-on-titan', 'shingeki-no-kyojin', 'anime', 'manga'],
        isPrivate: false,
        isSpoilerFree: true,
        maxMembers: 5000,
        createdBy: users[0]._id,
        members: [
          { userId: users[0]._id, role: 'admin' },
          { userId: users[1]._id, role: 'moderator' },
          { userId: users[2]._id, role: 'member' },
          { userId: users[3]._id, role: 'member' }
        ],
        posts: [
          {
            title: 'Season 4 Finale Discussion',
            content: 'What did everyone think of the final episode? The animation was absolutely incredible and the story wrapped up perfectly. I can\'t believe it\'s finally over after all these years!',
            author: users[0]._id,
            isSpoiler: true,
            spoilerFor: { showId: null, episodeNumber: 12 },
            likes: [
              { userId: users[1]._id, timestamp: new Date() },
              { userId: users[2]._id, timestamp: new Date() },
              { userId: users[3]._id, timestamp: new Date() }
            ],
            comments: [
              {
                userId: users[1]._id,
                content: 'The ending was perfect! I cried so much during the final scenes.',
                timestamp: new Date()
              },
              {
                userId: users[2]._id,
                content: 'I agree! The character development was amazing throughout the series.',
                timestamp: new Date()
              }
            ],
            tags: ['season-4', 'finale', 'discussion']
          },
          {
            title: 'Best Character Development',
            content: 'Which character do you think had the best development arc throughout the series? I personally think Eren\'s transformation was the most compelling.',
            author: users[1]._id,
            isSpoiler: false,
            likes: [
              { userId: users[0]._id, timestamp: new Date() },
              { userId: users[3]._id, timestamp: new Date() }
            ],
            comments: [
              {
                userId: users[2]._id,
                content: 'I think Armin had the best development. His growth from a scared kid to a strategic leader was incredible.',
                timestamp: new Date()
              }
            ],
            tags: ['character-development', 'discussion']
          }
        ],
        polls: [
          {
            question: 'Who is your favorite character in Attack on Titan?',
            options: [
              { text: 'Eren Yeager', votes: [{ userId: users[0]._id, timestamp: new Date() }] },
              { text: 'Mikasa Ackerman', votes: [{ userId: users[1]._id, timestamp: new Date() }, { userId: users[2]._id, timestamp: new Date() }] },
              { text: 'Armin Arlert', votes: [{ userId: users[3]._id, timestamp: new Date() }] },
              { text: 'Levi Ackerman', votes: [] },
              { text: 'Erwin Smith', votes: [] }
            ],
            isActive: true,
            createdBy: users[0]._id,
            isMultipleChoice: false
          },
          {
            question: 'Which season was the best?',
            options: [
              { text: 'Season 1', votes: [{ userId: users[2]._id, timestamp: new Date() }] },
              { text: 'Season 2', votes: [] },
              { text: 'Season 3', votes: [{ userId: users[1]._id, timestamp: new Date() }] },
              { text: 'Season 4', votes: [{ userId: users[0]._id, timestamp: new Date() }, { userId: users[3]._id, timestamp: new Date() }] }
            ],
            isActive: true,
            createdBy: users[1]._id,
            isMultipleChoice: false,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        ]
      },
      {
        name: 'Anime Discussion Hub',
        description: 'A general discussion club for all anime fans. Share recommendations, discuss new releases, and connect with fellow anime enthusiasts.',
        category: 'General',
        rules: [
          'Keep discussions civil',
          'No spoilers without tags',
          'Share constructive opinions',
          'Respect different tastes'
        ],
        tags: ['anime', 'discussion', 'general', 'community'],
        isPrivate: false,
        isSpoilerFree: false,
        maxMembers: 10000,
        createdBy: users[1]._id,
        members: [
          { userId: users[1]._id, role: 'admin' },
          { userId: users[0]._id, role: 'moderator' },
          { userId: users[2]._id, role: 'member' },
          { userId: users[3]._id, role: 'member' }
        ],
        posts: [
          {
            title: 'What anime are you watching this season?',
            content: 'Spring 2024 has some amazing shows! I\'m currently watching Demon Slayer, My Hero Academia, and a few others. What\'s on your watchlist?',
            author: users[1]._id,
            isSpoiler: false,
            likes: [
              { userId: users[0]._id, timestamp: new Date() },
              { userId: users[2]._id, timestamp: new Date() }
            ],
            comments: [
              {
                userId: users[2]._id,
                content: 'I\'m loving Demon Slayer this season! The animation is just incredible.',
                timestamp: new Date()
              },
              {
                userId: users[3]._id,
                content: 'Have you tried One Piece? It\'s been amazing lately!',
                timestamp: new Date()
              }
            ],
            tags: ['seasonal', 'discussion', 'recommendations']
          }
        ],
        polls: [
          {
            question: 'What genre of anime do you prefer?',
            options: [
              { text: 'Action/Adventure', votes: [{ userId: users[0]._id, timestamp: new Date() }, { userId: users[2]._id, timestamp: new Date() }] },
              { text: 'Romance', votes: [{ userId: users[3]._id, timestamp: new Date() }] },
              { text: 'Comedy', votes: [] },
              { text: 'Drama', votes: [{ userId: users[1]._id, timestamp: new Date() }] },
              { text: 'Sci-Fi/Fantasy', votes: [] }
            ],
            isActive: true,
            createdBy: users[1]._id,
            isMultipleChoice: true
          }
        ]
      },
      {
        name: 'Cosplay & Fan Art',
        description: 'Share your amazing cosplay photos and fan art! Whether you\'re a beginner or expert, all skill levels are welcome.',
        category: 'Fan Art',
        rules: [
          'Credit original artists',
          'No NSFW content',
          'Be supportive of all skill levels',
          'Share constructive feedback'
        ],
        tags: ['cosplay', 'fan-art', 'creative', 'community'],
        isPrivate: false,
        isSpoilerFree: true,
        maxMembers: 2000,
        createdBy: users[2]._id,
        members: [
          { userId: users[2]._id, role: 'admin' },
          { userId: users[0]._id, role: 'member' },
          { userId: users[1]._id, role: 'member' }
        ],
        posts: [
          {
            title: 'My Mikasa Cosplay',
            content: 'Just finished my Mikasa cosplay for the upcoming convention! The scarf was the hardest part to get right, but I\'m really happy with how it turned out.',
            author: users[2]._id,
            isSpoiler: false,
            likes: [
              { userId: users[0]._id, timestamp: new Date() },
              { userId: users[1]._id, timestamp: new Date() }
            ],
            comments: [
              {
                userId: users[0]._id,
                content: 'This looks amazing! The attention to detail is incredible.',
                timestamp: new Date()
              }
            ],
            tags: ['cosplay', 'mikasa', 'attack-on-titan']
          }
        ],
        polls: [
          {
            question: 'What type of content do you enjoy most?',
            options: [
              { text: 'Cosplay Photos', votes: [{ userId: users[0]._id, timestamp: new Date() }, { userId: users[1]._id, timestamp: new Date() }] },
              { text: 'Digital Art', votes: [{ userId: users[2]._id, timestamp: new Date() }] },
              { text: 'Traditional Art', votes: [] },
              { text: 'Cosplay Tutorials', votes: [] }
            ],
            isActive: true,
            createdBy: users[2]._id,
            isMultipleChoice: false
          }
        ]
      }
    ];

    // Clear existing clubs
    await Club.deleteMany({});

    // Create clubs
    const createdClubs = await Club.create(clubsData);

    console.log(`✅ Successfully seeded ${createdClubs.length} clubs with sample data`);
    console.log('📊 Sample clubs created:');
    createdClubs.forEach(club => {
      console.log(`   - ${club.name} (${club.members.length} members, ${club.posts.length} posts, ${club.polls.length} polls)`);
    });

  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
  }
};

module.exports = seedClubs;
