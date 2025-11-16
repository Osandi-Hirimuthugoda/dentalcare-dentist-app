# Database Connection Check Guide

## Step 1: Check if MongoDB is Connected

Run this command in the backend directory:

```bash
node test-db-connection.js
```

This will:
- ✅ Check if MONGO_URI is set in .env
- ✅ Test MongoDB connection
- ✅ Show total patients in database
- ✅ List recent 5 patients

## Step 2: Check Backend Server Logs

When you register a user, you should see these logs in the backend console:

```
📝 Registration request received: { name: '...', email: '...', phone: '...', age: ..., gender: '...' }
💾 Saving patient to database...
✅ Patient saved successfully with ID: ...
✅ Registration successful, sending response
```

If you see errors, check:
- ❌ MongoDB connection failed → Check MONGO_URI in .env
- ❌ Email already exists → User already registered
- ❌ Registration error → Check error message

## Step 3: Verify Data in MongoDB

You can use MongoDB Compass or MongoDB shell to check:

```javascript
// Connect to your MongoDB
use your_database_name

// Check patients collection
db.patients.find().pretty()

// Count patients
db.patients.countDocuments()

// Find specific patient
db.patients.findOne({ email: "user@example.com" })
```

## Step 4: Check .env File

Make sure you have a `.env` file in the backend directory with:

```
MONGO_URI=mongodb://localhost:27017/your_database_name
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

PORT=4000
JWT_SECRET=your_secret_key_here
```

## Troubleshooting

1. **Backend not running?**
   ```bash
   cd backend
   npm install
   npm start
   # OR for development:
   npm run dev
   ```

2. **MongoDB not connected?**
   - Check if MongoDB is running locally
   - Check MONGO_URI in .env file
   - Verify network connection for MongoDB Atlas

3. **Registration stuck in loading?**
   - Check backend console for errors
   - Check mobile app console/logs
   - Verify backend URL in mobile app: `http://10.0.2.2:4000/api` (Android emulator)

