# Connecting Azure Static Web Apps to GitHub

## Overview

Once you have your code on GitHub, you'll connect Azure Static Web Apps to automatically deploy on every push to `main` branch.

## Step 1: Update Bicep Template with GitHub Info

Before redeploying, update your GitHub repository URL in the Bicep template:

**File:** `infra/main.bicep` (around line 40)

Replace:
```bicep
repositoryUrl: 'https://github.com/username/daboyz-calendar'  // Update with actual repo
```

With your actual URL:
```bicep
repositoryUrl: 'https://github.com/YOUR_USERNAME/daboyz-calendar'
```

## Step 2: Azure Portal Configuration

### Option A: Manual Configuration (Recommended for First Time)

1. Go to **Azure Portal**: https://portal.azure.com
2. Find your resource group: **daboyz-rg**
3. Click on the **Static Web App**: `daboyz-app-*`
4. In the left sidebar, click **"Deployment tokens"**
5. Copy the deployment token (you'll use this in GitHub)
6. Click **"Manage deployment credentials"**
7. Note your deployment account

### Option B: Azure CLI

```powershell
$az = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

# Get deployment token
& $az staticwebapp secrets list `
  --resource-group daboyz-rg `
  --name daboyz-app-uhh3zjnmd4k5a `
  --query "properties.apiKey" -o tsv
```

## Step 3: Configure GitHub Repository

### Create GitHub Secret

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/daboyz-calendar`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. **Value:** Paste the deployment token from Azure Portal
6. Click **"Add secret"**

## Step 4: Create GitHub Actions Workflow

The workflow file already exists at `.github/workflows/azure-deploy.yml`

If it's missing, create it:

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "public/dist"
          api_location: "api"
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

## Step 5: Trigger First Deployment

Once you have:
1. ✅ GitHub repository with code pushed
2. ✅ Deployment token added as secret
3. ✅ GitHub Actions workflow in place

Push a new commit to trigger deployment:

```powershell
cd c:\Users\Jack\Documents\git\daboyz-calender
git add .
git commit -m "Configure Azure Static Web Apps deployment"
git push origin main
```

## Step 6: Monitor Deployment

1. Go to **GitHub** → Your repository → **Actions** tab
2. Watch the deployment workflow run
3. Once complete (~5 minutes), your app will be live!

## Step 7: Access Your App

Your app is now deployed at:
**https://purple-mud-0c6ae6c0f.7.azurestaticapps.net**

Test it:
- Create a persona
- Check calendar display
- Verify data persistence

## Troubleshooting

### Workflow fails with "Unauthorized"
- **Cause:** Deployment token is incorrect or expired
- **Fix:** Get a new token from Azure Portal and update the GitHub secret

### Build fails
- **Cause:** Missing dependencies or build script error
- **Fix:** Check GitHub Actions logs for details, run `npm run build` locally to debug

### App shows 404
- **Cause:** App location or output location is wrong in workflow
- **Fix:** Verify paths match your project structure:
  - App location: `public` (not `public/dist` - SWA handles the dist folder)
  - Output location: `dist`
  - API location: `api`

### Changes not appearing after push
- **Cause:** Workflow is still running or build failed
- **Fix:** Check GitHub Actions tab for status

## Next Steps

After successful deployment:

1. **Celebrate!** 🎉 Your app is live on Azure
2. **Share the URL** with your team
3. **Monitor costs** - Check Azure Portal > Cost Management
4. **Set up alerts** - Notify if cost exceeds $10/month
5. **Backup database** - Consider automated snapshots if needed

## Continuous Deployment

From now on, every time you:
- Push to `main` branch
- GitHub Actions automatically builds and deploys
- Your changes are live within 2-5 minutes
- No manual deployment needed!

---

**Need help?** Check the logs in:
- GitHub Actions: `https://github.com/YOUR_USERNAME/daboyz-calendar/actions`
- Azure Portal: Static Web App → "Deployment history"
