# MongoDB Atlas Setup Guide

## Quick Setup for MongoDB Atlas (Recommended)

Since you're getting MongoDB connection timeout errors, here's how to set up MongoDB Atlas (free cloud database):

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account with your email

### Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### Step 6: Update Your .env File

Replace the content in your `.env` file with:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/uthraa-naturals?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
```

**Important:** Replace `<username>`, `<password>`, and `<cluster>` with your actual values from the connection string.

### Step 7: Test the Connection

1. Start your server:
   ```bash
   npm run dev
   ```

2. Check the health endpoint:
   ```
   http://localhost:5000/api/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

## Alternative: Local MongoDB Installation

If you prefer to install MongoDB locally:

### Windows Installation

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (optional but recommended)
5. MongoDB will run as a Windows service automatically

### macOS Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux Installation (Ubuntu)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check username/password in connection string
   - Make sure database user has proper permissions

2. **"Network timeout"**
   - Check if your IP is whitelisted in MongoDB Atlas
   - Try "Allow Access from Anywhere" for testing

3. **"Connection refused"**
   - For local MongoDB: Make sure MongoDB service is running
   - For Atlas: Check network access settings

### Testing MongoDB Connection

```bash
# Test local MongoDB
mongosh
# or
mongo

# Test Atlas connection (replace with your connection string)
mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/uthraa-naturals"
```

## Next Steps

Once MongoDB is connected:

1. Your server should start without errors
2. The health endpoint should show "connected" status
3. You can start using the admin panel in your frontend
4. All CRUD operations will work properly

## Security Notes

- Change the JWT_SECRET in production
- Use environment-specific connection strings
- Restrict network access in production
- Use strong passwords for database users 