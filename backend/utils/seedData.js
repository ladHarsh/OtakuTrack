const Show = require('../models/Show');
const User = require('../models/User');
const Club = require('../models/Club');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const bcrypt = require('bcryptjs');

const sampleShows = [
  {
    title: "Attack on Titan",
    originalTitle: "進撃の巨人",
    description: "Humanity's last stand against giant humanoid creatures known as Titans. Eren Yeager joins the military to fight back and uncover the truth about these mysterious beings.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Drama", "Fantasy", "Thriller"],
    tags: ["post-apocalyptic", "military", "revenge", "mystery"],
    totalEpisodes: 25,
    season: "Spring",
    year: 2013,
    rating: { average: 9.0, count: 1500000 },
    poster: "https://i.postimg.cc/YqSS8NTg/e0dd00c8-8318-4bc9-a8a7-7f7163503f3a.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Wit Studio",
    source: "Manga",
    ageRating: "R+",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Death Note",
    originalTitle: "デスノート",
    description: "A brilliant student discovers a supernatural notebook that allows him to kill anyone whose name he writes in it. He decides to use it to rid the world of evil.",
    type: "TV",
    status: "Completed",
    genres: ["Mystery", "Psychological", "Thriller", "Supernatural"],
    tags: ["crime", "detective", "supernatural", "mind-games"],
    totalEpisodes: 37,
    season: "Fall",
    year: 2006,
    rating: { average: 8.9, count: 1200000 },
    poster: "https://i.postimg.cc/rmydkG01/3059d63c-2504-4513-ae6c-00c2d57e7dbf.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Madhouse",
    source: "Manga",
    ageRating: "R+",
    duration: 23,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "My Hero Academia",
    originalTitle: "僕のヒーローアカデミア",
    description: "In a world where people with superpowers are the norm, Izuku Midoriya has dreams of becoming a hero despite being born Quirkless.",
    type: "TV",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    tags: ["superhero", "school", "friendship", "determination"],
    totalEpisodes: 138,
    season: "Spring",
    year: 2016,
    rating: { average: 8.4, count: 800000 },
    poster: "https://i.postimg.cc/BZP3vYWm/b305ba7d-e8fc-465a-a365-6cfa0935d22f.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Bones",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Demon Slayer",
    originalTitle: "鬼滅の刃",
    description: "Tanjiro Kamado becomes a demon slayer after his family is attacked and his sister is turned into a demon.",
    type: "TV",
    status: "Ongoing",
    genres: ["Action", "Fantasy", "Historical", "Supernatural"],
    tags: ["demons", "swordsmanship", "family", "revenge"],
    totalEpisodes: 44,
    season: "Spring",
    year: 2019,
    rating: { average: 8.7, count: 900000 },
    poster: "https://i.postimg.cc/zvxK6zJk/454ee82b-8e82-4e51-a33b-a86111a55e58.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "ufotable",
    source: "Manga",
    ageRating: "R+",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "One Punch Man",
    originalTitle: "ワンパンマン",
    description: "Saitama is a hero who can defeat any opponent with a single punch, but he finds it difficult to find a worthy opponent.",
    type: "TV",
    status: "Ongoing",
    genres: ["Action", "Comedy", "Fantasy", "Parody"],
    tags: ["superhero", "comedy", "overpowered", "satire"],
    totalEpisodes: 24,
    season: "Fall",
    year: 2015,
    rating: { average: 8.5, count: 700000 },
    poster: "https://i.postimg.cc/150Lgbvr/ONE-PUNCH-MAN-Poster-61-X91-Collage.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Madhouse",
    source: "Other",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    originalTitle: "鋼の錬金術師 FULLMETAL ALCHEMIST",
    description: "Two brothers seek to restore their bodies after a failed alchemical experiment using the Philosopher's Stone.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    tags: ["alchemy", "brothers", "redemption", "war"],
    totalEpisodes: 64,
    season: "Spring",
    year: 2009,
    rating: { average: 9.1, count: 1100000 },
    poster: "https://i.postimg.cc/CxQnbr1z/3511958e-7883-46d5-8a1d-c3ae7bf9c349.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Bones",
    source: "Manga",
    ageRating: "R+",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Naruto",
    originalTitle: "ナルト",
    description: "A young ninja seeks to become the strongest ninja in his village and earn the respect of his peers.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    tags: ["ninja", "friendship", "determination", "village"],
    totalEpisodes: 720,
    season: "Fall",
    year: 2002,
    rating: { average: 8.3, count: 2000000 },
    poster: "https://i.postimg.cc/Njmvx5Gm/71524dc9-319f-421d-b57f-32943ed14fc4.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Studio Pierrot",
    source: "Manga",
    ageRating: "PG-13",
    duration: 23,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Dragon Ball Z",
    originalTitle: "ドラゴンボールZ",
    description: "Goku and his friends defend Earth against powerful villains while searching for the Dragon Balls.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Fantasy", "Sports"],
    tags: ["martial-arts", "super-saiyan", "dragon-balls", "friendship"],
    totalEpisodes: 291,
    season: "Spring",
    year: 1989,
    rating: { average: 8.2, count: 1800000 },
    poster: "https://i.postimg.cc/sfHzjk0Q/Dragonballz.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Toei Animation",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Jujutsu Kaisen",
    originalTitle: "呪術廻戦",
    description: "Yuji Itadori becomes a jujutsu sorcerer after ingesting a cursed object, battling powerful curses to protect humanity.",
    type: "TV",
    status: "Ongoing",
    genres: ["Action", "Supernatural", "Fantasy", "Drama"],
    tags: ["curses", "sorcery", "dark-fantasy", "battle"],
    totalEpisodes: 47,
    season: "Fall",
    year: 2020,
    rating: { average: 8.8, count: 900000 },
    poster: "https://i.postimg.cc/fTsPhBMt/Jujutsu-Kaisen-HD-Poster.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "MAPPA",
    source: "Manga",
    ageRating: "R+",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "One Piece",
    originalTitle: "ワンピース",
    description: "Monkey D. Luffy sets out on a journey to find the One Piece treasure and become the Pirate King.",
    type: "TV",
    status: "Ongoing",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    tags: ["pirates", "adventure", "friendship", "epic"],
    totalEpisodes: 1080,
    season: "Fall",
    year: 1999,
    rating: { average: 8.9, count: 2000000 },
    poster: "https://i.postimg.cc/bws9XtSS/One-Piece-HD-Wallpaper.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Toei Animation",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Sword Art Online",
    originalTitle: "ソードアート・オンライン",
    description: "Players get trapped in a virtual MMORPG where death in the game means death in real life.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Romance", "Fantasy"],
    tags: ["MMORPG", "virtual-reality", "sword-fighting", "romance"],
    totalEpisodes: 96,
    season: "Summer",
    year: 2012,
    rating: { average: 7.8, count: 800000 },
    poster: "https://i.postimg.cc/1zm6m1bV/Sword-Art-Online.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "A-1 Pictures",
    source: "Light Novel",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Tokyo Ghoul",
    originalTitle: "東京喰種トーキョーグール",
    description: "Kaneki Ken becomes a half-ghoul after an encounter with a deadly ghoul, struggling between two worlds.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Horror", "Drama", "Supernatural"],
    tags: ["ghouls", "dark", "psychological", "tragedy"],
    totalEpisodes: 48,
    season: "Summer",
    year: 2014,
    rating: { average: 7.9, count: 700000 },
    poster: "https://i.postimg.cc/v8rnCvPN/antes-e-depois.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Pierrot",
    source: "Manga",
    ageRating: "R+",
    duration: 24,
    isPopular: true,
    isRecommended: false,
    isActive: true
  },
  {
    title: "Haikyuu!!",
    originalTitle: "ハイキュー!!",
    description: "Shoyo Hinata dreams of becoming a top volleyball player despite his short height.",
    type: "TV",
    status: "Completed",
    genres: ["Sports", "Comedy", "Drama"],
    tags: ["volleyball", "friendship", "determination", "school"],
    totalEpisodes: 85,
    season: "Spring",
    year: 2014,
    rating: { average: 8.7, count: 650000 },
    poster: "https://i.postimg.cc/GtFSysxm/bd67b71c-68bd-4343-b8fd-b17e8ff91983.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Production I.G",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Bleach",
    originalTitle: "ブリーチ",
    description: "Ichigo Kurosaki gains the powers of a Soul Reaper and protects humans from evil spirits.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Supernatural", "Fantasy"],
    tags: ["soul-reapers", "shinigami", "battle", "friendship"],
    totalEpisodes: 366,
    season: "Fall",
    year: 2004,
    rating: { average: 8.2, count: 900000 },
    poster: "https://i.postimg.cc/gkrY3z6H/911318a5-a7d4-4e2d-ac76-d6d2dacdcf30.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "Pierrot",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: true,
    isActive: true
  },
  {
    title: "Fairy Tail",
    originalTitle: "フェアリーテイル",
    description: "A guild of wizards go on adventures filled with magic, friendship, and battles.",
    type: "TV",
    status: "Completed",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    tags: ["magic", "guilds", "friendship", "quests"],
    totalEpisodes: 328,
    season: "Fall",
    year: 2009,
    rating: { average: 7.9, count: 600000 },
    poster: "https://i.postimg.cc/Qxcf4558/4183f5e3-5dbd-44cc-95e9-403a6b3d54c2.jpg",
    banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
    studio: "A-1 Pictures",
    source: "Manga",
    ageRating: "PG-13",
    duration: 24,
    isPopular: true,
    isRecommended: false,
    isActive: true
  },
];

const sampleClubs = [
  {
    name: "Attack on Titan Fan Club",
    description: "A community for fans of the epic anime series Attack on Titan. Discuss theories, share fan art, and connect with fellow fans.",
    tags: ["attack-on-titan", "shingeki-no-kyojin", "titan", "eren"],
    category: "Show",
    isActive: true,
    isApproved: true
  },
  {
    name: "Death Note Theorists",
    description: "For fans who love to analyze and discuss the complex plot of Death Note. Share your theories and interpretations.",
    tags: ["death-note", "light-yagami", "L", "mind-games"],
    category: "Discussion",
    isActive: true,
    isApproved: true
  },
  {
    name: "My Hero Academia Heroes",
    description: "Join the ranks of heroes! Discuss character development, quirks, and the future of hero society.",
    tags: ["my-hero-academia", "heroes", "quirks", "plus-ultra"],
    category: "Show",
    isActive: true,
    isApproved: true
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await Show.deleteMany({});
    await Club.deleteMany({});
    await Review.deleteMany({});
    await Watchlist.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Remove existing admin to ensure password reset
    await User.deleteOne({ email: 'admin@otakutrack.com' });

    // Create admin user first if it doesn't exist
    let adminUser = await User.findOne({ email: 'admin@otakutrack.com' });
    if (!adminUser) {
      // Pass plain password, let User model pre-save hook handle hashing
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@otakutrack.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Created admin user (admin@otakutrack.com / admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample shows
    const createdShows = await Show.insertMany(sampleShows);
    console.log(`✅ Created ${createdShows.length} shows`);

    // Skip creating sample clubs per configuration
    console.log('⏭️ Skipping sample clubs seeding');

    console.log('🎉 Data seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   Shows: ${createdShows.length}`);
    console.log('\n🔑 Admin Account:');
    console.log('   Email: admin@otakutrack.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData;
