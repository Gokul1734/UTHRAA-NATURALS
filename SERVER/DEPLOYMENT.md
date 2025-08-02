# Backend Deployment Guide

## Environment Variables Required

Create a `.env` file in the SERVER directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/uthraa_naturals?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Render Deployment Steps

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend code

3. **Configure Service**:
   - **Name**: `uthraa-naturals-backend`
   - **Root Directory**: `SERVER` (if your backend is in a subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**:
   - Add all the environment variables from the `.env` file above
   - Make sure to use your actual MongoDB connection string and JWT secret

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically deploy your application

## Important Notes

- The service will be available at: `https://your-service-name.onrender.com`
- Update your frontend API base URL to point to this new backend URL
- Make sure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) for Render 