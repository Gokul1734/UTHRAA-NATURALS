# 🚀 Uthraa Naturals Deployment Guide

This guide will help you deploy your Uthraa Naturals e-commerce platform to production.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Render Account**: For backend deployment
4. **Vercel Account**: For frontend deployment

## 🔧 Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string
4. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

### Step 2: Deploy to Render

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**:
   - **Name**: `uthraa-naturals-backend`
   - **Root Directory**: `SERVER`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/uthraa_naturals?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

5. **Deploy**: Click "Create Web Service"

### Step 3: Get Backend URL

Your backend will be available at: `https://your-service-name.onrender.com`

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Import Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-backend-name.onrender.com/api
   REACT_APP_FRONTEND_URL=https://your-project-name.vercel.app
   ```

5. **Deploy**: Click "Deploy"

### Step 2: Get Frontend URL

Your frontend will be available at: `https://your-project-name.vercel.app`

## 🔗 Connect Backend and Frontend

1. **Update Backend CORS**:
   - Go to your Render service settings
   - Update the `FRONTEND_URL` environment variable with your Vercel URL

2. **Update Frontend API URL**:
   - Go to your Vercel project settings
   - Update the `REACT_APP_API_URL` with your Render backend URL

3. **Redeploy Both Services**:
   - Trigger a new deployment on both Render and Vercel

## 🧪 Testing Your Deployment

1. **Test Backend**: Visit `https://your-backend-name.onrender.com/api/health`
2. **Test Frontend**: Visit your Vercel URL
3. **Test Image Uploads**: Try uploading images in the admin panel
4. **Test API Calls**: Check if the frontend can communicate with the backend

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret
2. **MongoDB Security**: Use strong passwords and restrict IP access
3. **Environment Variables**: Never commit sensitive data to your repository
4. **CORS**: Only allow your frontend domain in CORS settings

## 🐛 Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend Issues
- Check Vercel build logs
- Verify API URL in environment variables
- Check browser console for CORS errors

### Image Upload Issues
- Verify upload directory permissions
- Check file size limits
- Ensure proper URL construction

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check CORS configuration

## 🎉 Success!

Once deployed, your Uthraa Naturals e-commerce platform will be live and accessible to users worldwide! 