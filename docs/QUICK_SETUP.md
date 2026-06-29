# Quick Azure + GitHub Deployment Setup

## Your GitHub Details
- **Username:** beegul
- **Repository:** https://github.com/beegul/daboyz-calendar
- **Branch:** main

## Your Azure Details
- **Static Web App:** daboyz-app-uhh3zjnmd4k5a
- **Resource Group:** daboyz-rg
- **Production URL:** https://purple-mud-0c6ae6c0f.7.azurestaticapps.net

---

## Step 1: Add GitHub Secret (THIS IS REQUIRED)

**Your deployment token:**
```
d1604142a51c9733fcc0ad7211dc9571ff153383c513c2f22c5f7ca2da58a09907-3b623d26-612d-4746-a255-3f3e41e466c500f09320c6ae6c0f
```

**Steps:**
1. Go to GitHub: https://github.com/beegul/daboyz-calendar
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. **Value:** (paste token above)
6. Click **"Add secret"**

---

## Step 2: Verify GitHub Actions Workflow

Check that the file `.github/workflows/azure-deploy.yml` exists in your repo.

If not, GitHub will create it automatically from the Azure Portal connection.

---

## Step 3: Trigger Deployment

Either:
- **Option A:** Push new code to main branch:
  ```powershell
  cd c:\Users\Jack\Documents\git\daboyz-calender
  git commit --allow-empty -m "Trigger deployment"
  git push origin main
  ```

- **Option B:** Go to Azure Portal and click "Redeploy" on the SWA

---

## What Happens Next
1. GitHub Actions workflow runs (you'll see it in Actions tab)
2. App builds (~2 minutes)
3. Deploys to Static Web Apps (~1 minute)
4. Your app is live! 🎉

---

## Success Indicators

✅ **GitHub Actions** tab shows green checkmark
✅ **Azure Portal** shows "Ready" instead of "Waiting for deployment"
✅ **App URL** responds and shows your calendar app

---

## Troubleshooting

**If deployment fails:**
1. Check GitHub Actions logs (Actions tab)
2. Check Azure SWA logs (Portal → Deployment history)
3. Verify secret was added correctly
4. Ensure npm run build works locally
