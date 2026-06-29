# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new** (or click "+" → "New repository" in GitHub)
2. Repository name: `daboyz-calendar`
3. Description: `Calendar app with persona availability and adaptive polling`
4. Choose: **Public** (recommended for learning/portfolio) or **Private** (more secure)
5. **DO NOT** initialize with README, .gitignore, or license (we have these locally)
6. Click **"Create repository"**

## Step 2: Get Your Repository URL

After creating, you'll see commands like:
```
git remote add origin https://github.com/YOUR_USERNAME/daboyz-calendar.git
git branch -M main
git push -u origin main
```

Save your repository URL: `https://github.com/YOUR_USERNAME/daboyz-calendar.git`

## Step 3: Push Code to GitHub

In PowerShell (in the project folder), run:

```powershell
cd c:\Users\Jack\Documents\git\daboyz-calender

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/daboyz-calendar.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

Expected output:
```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
Compressing objects: ...
Total ... (delta ...
To https://github.com/YOUR_USERNAME/daboyz-calendar.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## Step 4: Verify on GitHub

1. Go to your repository: `https://github.com/YOUR_USERNAME/daboyz-calendar`
2. You should see all your files including:
   - `public/` (frontend React code)
   - `api/` (Azure Functions)
   - `infra/` (Bicep infrastructure templates)
   - `docs/` (deployment guides)

## Complete! 

Once this is done, send me your GitHub repository URL and I'll configure Azure Static Web Apps to automatically deploy from GitHub.

Your Azure infrastructure is already waiting:
- **Static Web App:** https://purple-mud-0c6ae6c0f.7.azurestaticapps.net
- **Storage Account:** daboyzstguhh3zjnmd4k5a
- **Table:** DaboyzAvailability
