const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedAnalyticsData } = require('./utils/seedAnalytics');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await seedAnalyticsData();
    console.log('✅ Analytics seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during analytics seeding:', error);
    process.exit(1);
  }
};

// Run the script
main();
