import mongoose from "mongoose";

/**
 * Optional MongoDB connection - allows backend to continue even if MongoDB fails
 * Useful for testing AI scan feature without database setup
 */
const connectDB = async (options = {}) => {
  const { allowFailure = false } = options;
  
  try {
    if (!process.env.MONGO_URI) {
      if (allowFailure) {
        console.warn("⚠️  MONGO_URI is not set in .env file");
        console.warn("⚠️  Backend will continue without database");
        console.warn("⚠️  Database features will be disabled");
        return false;
      }
      console.error("❌ MONGO_URI is not set in .env file");
      console.error("   Please create a .env file in the backend folder");
      console.error("   Example: MONGO_URI=mongodb://localhost:27017/dentalcare");
      process.exit(1);
    }
    
    console.log("🔌 Connecting to MongoDB...");
    
    const connectOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    };
    
    const conn = await mongoose.connect(process.env.MONGO_URI, connectOptions);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    return true;
    
  } catch (error) {
    if (allowFailure) {
      console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
      console.warn("⚠️  Backend will continue without database");
      console.warn("⚠️  Database features (auth, appointments, etc.) will be disabled");
      console.warn("⚠️  AI scan feature will still work (doesn't need database)");
      console.warn("\n📝 To fix MongoDB connection:");
      console.warn("   1. Whitelist your IP in MongoDB Atlas");
      console.warn("   2. Or use local MongoDB: mongodb://localhost:27017/dentalcare");
      console.warn("   3. See: backend/QUICK_FIX_MONGODB.md");
      return false;
    }
    
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("\n💡 Troubleshooting:");
    console.error("1. Check your .env file has MONGO_URI set");
    console.error("2. If using local MongoDB, make sure it's running");
    console.error("3. If using MongoDB Atlas, check your connection string");
    console.error("4. If using MongoDB Atlas, whitelist your IP address");
    console.error("\n📖 See: backend/QUICK_FIX_MONGODB.md for detailed guide");
    console.error("\n💡 Tip: Set ALLOW_DB_FAILURE=true in .env to continue without database");
    console.error("\n   Local MongoDB example: mongodb://localhost:27017/dentalcare");
    process.exit(1);
  }
};

export default connectDB;



