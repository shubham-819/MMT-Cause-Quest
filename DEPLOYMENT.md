# AWS Amplify Deployment Guide

This guide will help you deploy the MMT Cause Quest application to AWS Amplify.

## 🚀 Prerequisites

- AWS Account with Amplify access
- GitHub/GitLab repository containing your code
- Admin access to your repository

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository contains:
- ✅ `amplify.yml` (build configuration)
- ✅ Environment files (`.env.example`)
- ✅ Updated package.json files
- ✅ Vite configuration

### 2. AWS Amplify Console Setup

1. **Login to AWS Console**
   - Navigate to AWS Amplify service
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Choose your Git provider (GitHub/GitLab)
   - Authenticate and select your repository
   - Choose the branch (usually `main` or `master`)

3. **App Settings**
   - App name: `mmt-cause-quest`
   - Environment: `production` (or your preferred environment)

### 3. Build Configuration

Amplify should automatically detect the `amplify.yml` file. Verify it contains:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```

### 4. Environment Variables

Set these environment variables in Amplify Console:

#### Frontend Variables (Build-time)
```
VITE_API_URL=https://your-api-domain.com
VITE_APP_TITLE=MMT Cause Quest
VITE_NODE_ENV=production
```

#### Backend Variables (if using Amplify Functions)
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
DATABASE_URL=your-database-url
```

### 5. Custom Domain (Optional)

1. Go to "Domain management" in Amplify Console
2. Add your custom domain
3. Configure DNS settings as instructed
4. Wait for SSL certificate provisioning

## 🔧 Build Troubleshooting

### Common Issues

#### 1. Build Fails - Node Version
**Error**: Node version incompatibility
**Solution**: Add to amplify.yml:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - node --version
        - npm --version
        - cd client
        - npm ci
```

#### 2. Environment Variables Not Working
**Error**: `VITE_` variables undefined
**Solution**: 
- Ensure variables start with `VITE_`
- Restart build after adding variables
- Check case sensitivity

#### 3. API Connection Issues
**Error**: Frontend can't connect to backend
**Solution**:
- Update `VITE_API_URL` to correct backend URL
- Check CORS settings in backend
- Verify API endpoints are accessible

### 4. Database Issues
**Error**: Database connection failed
**Solution**:
- If using SQLite, consider migrating to PostgreSQL/MySQL for production
- Set up RDS instance for production database
- Update connection strings

## 🔄 Continuous Deployment

### Automatic Deployments
- Amplify automatically deploys on push to connected branch
- Build logs available in Amplify Console
- Failed builds prevent deployment

### Manual Deployments
```bash
# Trigger manual build
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type RELEASE
```

## 🐛 Debugging Deployments

### 1. Check Build Logs
- Go to Amplify Console → Your App → Build history
- Click on failed build to see detailed logs
- Look for specific error messages

### 2. Test Locally
```bash
# Test build locally before deploying
npm run build
npm run preview
```

### 3. Environment Parity
Ensure your local `.env` matches production environment variables.

## 📊 Monitoring & Performance

### 1. CloudWatch Integration
- Amplify automatically integrates with CloudWatch
- Monitor build times, errors, and performance
- Set up alerts for build failures

### 2. Performance Optimization
- Enable compression in amplify.yml
- Optimize images and assets
- Use CDN for static assets

## 🛡️ Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique JWT secrets
- Rotate secrets regularly

### 2. Database Security
- Use connection pooling
- Enable SSL connections
- Regular backups

### 3. API Security
- Implement rate limiting
- Use HTTPS only
- Validate all inputs

## 🔄 Rollback Strategy

### Automatic Rollback
```bash
# Rollback to previous version
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type ROLLBACK
```

### Manual Rollback
1. Go to Amplify Console
2. Select "Deployments" 
3. Choose previous successful deployment
4. Click "Redeploy this version"

## 📝 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] File uploads work
- [ ] Database operations work
- [ ] All environment variables are set
- [ ] Custom domain (if configured) works
- [ ] SSL certificate is active
- [ ] Performance is acceptable

## 🆘 Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify CLI Guide](https://docs.amplify.aws/cli/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🎉 Success!

Your MMT Cause Quest application should now be live on AWS Amplify!

**Production URL**: `https://your-app-id.amplifyapp.com`

Remember to update any hardcoded URLs in your application to use the production domain.
