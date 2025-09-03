# Deployment Guide

## Quick Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings
   - Click "Deploy"

3. **Add Database**
   - After deployment, go to your project dashboard
   - Navigate to "Integrations" tab
   - Find "Neon" in the marketplace and click "Add"
   - Follow the setup wizard to create a new database
   - The `DATABASE_URL` environment variable will be automatically added

4. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - Your app is now live with database!

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Add Database** (same as Option 1, step 3-4)

## Environment Variables

The following variable will be automatically set when you add Neon via Vercel marketplace:

```env
DATABASE_URL
```

## Post-Deployment Checklist

- [ ] Project deployed successfully
- [ ] Database connected and environment variables set
- [ ] Test the user management functionality
- [ ] Check that API routes are working
- [ ] Verify responsive design on mobile

## Troubleshooting

**Build Fails?**
- Check that all dependencies are in `package.json`
- Ensure TypeScript types are correct
- Review build logs for specific errors

**Database Connection Issues?**
- Verify environment variables are set
- Check that Vercel Postgres is properly connected
- Ensure database region matches your deployment region

**API Routes Not Working?**
- Check function timeout settings in `vercel.json`
- Verify API routes are in correct directory structure
- Check server logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains" tab  
3. Add your custom domain
4. Follow DNS configuration instructions

Your Next.js app with Vercel Postgres is now ready for production! 🚀
