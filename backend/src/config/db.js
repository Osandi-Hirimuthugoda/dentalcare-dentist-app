import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file");
      console.error("📝 Please create a .env file in the backend folder");
      console.error("💡 Example: MONGO_URI=mongodb://localhost:27017/dentalcare");
      process.exit(1);
    }
    
    console.log("🔌 Connecting to MongoDB...");
    
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    };
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check your .env file has MONGO_URI set");
    console.error("2. If using local MongoDB, make sure it's running");
    console.error("3. If using MongoDB Atlas, check your connection string");
    console.error("\n💡 Local MongoDB example: mongodb://localhost:27017/dentalcare");
    process.exit(1);
  }
};

export default connectDB;
