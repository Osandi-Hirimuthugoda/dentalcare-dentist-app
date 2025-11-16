# Backend Server Start Guide

## Step 1: Start Backend Server

Open a new terminal and run:

```bash
cd backend
npm start
```

OR for development (auto-restart on changes):

```bash
cd backend
npm run dev
```

You should see:
```
🔌 Connecting to MongoDB...
✅ MongoDB Connected: ...
📊 Database: dentalcare
Server running on port 4000
```

## Step 2: Test Registration

While the server is running, try registering from the mobile app. You should see logs like:

```
📝 Registration request received: { name: '...', email: '...', phone: '...', age: ..., gender: '...' }
💾 Saving patient to database...
✅ Patient saved successfully with ID: ...
✅ Registration successful, sending response
```

## Step 3: Check Database After Registration

After registering, run:

```bash
node test-db-connection.js
```

You should see:
```
👥 Total patients in database: 1 (or more)
📋 Recent patients:
  1. Your Name (your@email.com) - Created: ...
```

## Troubleshooting

### Server won't start?
- Check if port 4000 is already in use
- Make sure `.env` file exists with `MONGO_URI` and `JWT_SECRET`

### No logs when registering?
- Check if mobile app is using correct backend URL: `http://10.0.2.2:4000/api`
- Check backend console for errors
- Verify CORS is enabled in backend

### Data not saving?
- Check backend console for error messages
- Verify MongoDB connection is successful
- Check if email already exists (409 error)

