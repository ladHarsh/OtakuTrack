require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('./utils/seedData');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/otakutrack')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return seedData();
  })
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
