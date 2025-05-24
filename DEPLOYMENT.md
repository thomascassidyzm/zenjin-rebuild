# Deploying Zenjin Maths App to Vercel

This guide provides step-by-step instructions for deploying the Zenjin Maths APML application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (can sign up with your GitHub account)
- Git installed locally

## Step 1: Commit Your Changes

Make sure all your configuration files are committed to your repository:

```bash
git add .
git commit -m "Update configuration for Vercel deployment"
git push
```

## Step 2: Deploy to Vercel

### Option 1: Deploy via Vercel Web Interface (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Keep the default settings:
   - Framework preset: Vite
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
4. Click "Deploy"

### Option 2: Deploy via Vercel CLI

If you prefer using the command line:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   cd /Users/tomcassidy/claude-code-experiments/APML-Projects/zenjin-rebuild
   vercel
   ```

4. Follow the prompts. Select "No" when asked if you want to override settings, as our config files will handle everything.

## Step 3: Configure Domain (Optional)

If you want to use a custom domain:

1. Go to your project on Vercel
2. Navigate to "Settings" > "Domains"
3. Add your domain and follow the instructions

## Important Configuration Files

The deployment relies on these key configuration files:

- **vercel.json**: Configures routing for SPA and caching rules
- **vite.config.ts**: Optimizes the build for production
- **tsconfig.json**: TypeScript configuration
- **package.json**: Defines build commands and dependencies
- **api/config.ts**: Runtime configuration endpoint for environment variables
- **.env.example**: Example environment variables (for local development only)

## Environment Variables (Supabase Integration)

### Automatic Configuration
When you integrate Supabase with Vercel:
1. Vercel automatically sets `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Our runtime configuration service (`/api/config`) exposes these to the frontend
3. No manual environment variable setup required!

### Manual Configuration (if needed)
If you're not using the Supabase integration, add these in Vercel's project settings:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Troubleshooting

If you encounter issues during deployment:

1. **Build failures**: Check the build logs in Vercel for specific errors
2. **Routing issues**: Ensure vercel.json has the correct rewrites for SPAs
3. **Missing dependencies**: Verify all dependencies are in package.json
4. **Environment variables**: Check `/api/config` endpoint is accessible
5. **Supabase connection**: Run APML validation tests from the dashboard

## Development Workflow

For ongoing development:

1. Create a new branch for features:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes and commit
3. Push to GitHub:
   ```bash
   git push origin feature/new-feature
   ```

4. Vercel will automatically create a preview deployment for your branch
5. When ready, merge to main branch and Vercel will update production

## Reference

- [Vite Documentation](https://vitejs.dev/guide/)
- [Vercel Documentation](https://vercel.com/docs)
- [SPA Routing on Vercel](https://vercel.com/guides/deploying-react-with-vercel)