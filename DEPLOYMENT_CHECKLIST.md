# ✅ Deployment Checklist

## 🔧 Backend (Render) Setup

- [ ] Create Render account
- [ ] Set up MongoDB Atlas cluster
- [ ] Get MongoDB connection string
- [ ] Create new Web Service on Render
- [ ] Set Root Directory to `SERVER`
- [ ] Configure environment variables:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (your Atlas connection string)
  - [ ] `JWT_SECRET` (strong random string)
  - [ ] `FRONTEND_URL` (will update after frontend deployment)
  - [ ] `MAX_FILE_SIZE=5242880`
  - [ ] `UPLOAD_PATH=./uploads`
- [ ] Deploy backend service
- [ ] Test backend health endpoint
- [ ] Note down backend URL

## 🎨 Frontend (Vercel) Setup

- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Configure environment variables:
  - [ ] `REACT_APP_API_URL` (your Render backend URL + `/api`)
  - [ ] `REACT_APP_FRONTEND_URL` (your Vercel URL)
- [ ] Deploy frontend
- [ ] Test frontend loads correctly
- [ ] Note down frontend URL

## 🔗 Connect Services

- [ ] Update backend `FRONTEND_URL` with Vercel URL
- [ ] Update frontend `REACT_APP_API_URL` with Render URL
- [ ] Redeploy both services
- [ ] Test full application functionality

## 🧪 Testing

- [ ] Test backend API endpoints
- [ ] Test frontend loads without errors
- [ ] Test image uploads work
- [ ] Test admin panel functionality
- [ ] Test user registration/login
- [ ] Test product browsing
- [ ] Test cart functionality

## 🔒 Security

- [ ] Verify JWT secret is strong
- [ ] Check MongoDB Atlas security settings
- [ ] Verify CORS settings
- [ ] Test authentication flows

## 📝 Final Steps

- [ ] Update any hardcoded URLs in code
- [ ] Test on different devices/browsers
- [ ] Set up monitoring (optional)
- [ ] Document deployment URLs
- [ ] Share with team/stakeholders

## 🎉 Success!

- [ ] Application is live and functional
- [ ] All features working correctly
- [ ] Images loading properly
- [ ] API communication working
- [ ] Ready for production use 