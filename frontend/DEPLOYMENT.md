# Frontend Deployment Guide (Vercel)

## Environment Variables Required

Create environment variables in Vercel with the following:

```env
REACT_APP_API_URL=https://your-backend-name.onrender.com/api
REACT_APP_FRONTEND_URL=https://uthraa-naturals.vercel.app
```

## Vercel Deployment Steps

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

3. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set the following configuration:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend` (if your frontend is in a subdirectory)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

4. **Environment Variables**:
   - Go to your project settings in Vercel
   - Add the environment variables listed above
   - Make sure to use your actual backend URL from Render

5. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## Important Notes

- Your app will be available at: `https://your-project-name.vercel.app`
- Update your backend CORS settings to allow your Vercel domain
- The `vercel.json` file is already configured for proper routing with Vite
- Make sure your backend is deployed and accessible before deploying the frontend

## Development

To run the frontend locally:
```bash
cd frontend
npm install
npm run dev
```

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update your environment variables with the custom domain

## Troubleshooting

- If images don't load, check that your backend URL is correct in environment variables
- If API calls fail, verify CORS settings in your backend
- Check Vercel build logs for any build errors
- Make sure all dependencies are installed with `npm install` 