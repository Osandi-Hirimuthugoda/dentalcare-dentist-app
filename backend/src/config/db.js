import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error(" MONGO_URI is not set in .env file");
      console.error(" Please create a .env file in the backend folder");
      console.error(" Example: MONGO_URI=mongodb://localhost:27017/dentalcare");
      process.exit(1);
    }
    
    console.log("🔌 Connecting to MongoDB...");
    
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    };
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(` MongoDB Connected Successfully!`);
    console.log(`  Host: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(` MongoDB connection failed: ${error.message}`);
    console.error("\n Troubleshooting:");
    console.error("1. Check your .env file has MONGO_URI set");
    console.error("2. If using local MongoDB, make sure it's running");
    console.error("3. If using MongoDB Atlas, check your connection string");
    console.error("4. If using MongoDB Atlas, whitelist your IP address");
    console.error("\n Local MongoDB example: mongodb://localhost:27017/dentalcare");
    
    // Check if we should allow failure (development mode)
    if (process.env.ALLOW_DB_FAILURE === 'true') {
      console.warn("\n⚠️  ALLOW_DB_FAILURE=true detected");
      console.warn("⚠️  Backend will continue without database (development mode)");
      console.warn("⚠️  Database features (auth, appointments, etc.) will be disabled");
      console.warn("⚠️  AI scan feature will still work");
      return; // Don't exit, allow server to continue
    }
    
    console.error("\n💡 To continue without database (development only):");
    console.error("   Set ALLOW_DB_FAILURE=true in .env file");
    console.error("   ⚠️  Warning: Database features will be disabled!");
    console.error("\n📖 See: backend/QUICK_FIX_MONGODB.md for MongoDB setup guide");
    process.exit(1);
  }
};

export default connectDB;
