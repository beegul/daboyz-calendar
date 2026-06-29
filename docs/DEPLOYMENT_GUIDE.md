# Azure Deployment Guide - Feature 004

## Prerequisites

Before you begin, ensure you have:
- ✅ Azure CLI 2.87.0+ installed
- ✅ Node.js 18+ installed
- ✅ Git access to this repository
- ✅ An active Azure subscription (Free Trial eligible)

## Step 1: Authenticate with Azure

Open PowerShell and run:

```powershell
az login
```

A browser window will open. Sign in with your Microsoft account. After successful authentication, you'll see your subscription details in the terminal.

**Expected Output:**
```
[
  {
    "cloudName": "AzureCloud",
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "isDefault": true,
    "name": "Free Trial",
    "state": "Enabled",
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "user": { "name": "your-email@example.com", "type": "user" }
  }
]
```

**Save your subscription ID** - you'll need this later.

## Step 2: Create Resource Group

```powershell
# Set your subscription as default
az account set --subscription "SUBSCRIPTION_ID_FROM_ABOVE"

# Create resource group
az group create `
  --name daboyz-rg `
  --location eastus
```

**Expected Output:**
```json
{
  "id": "/subscriptions/.../resourceGroups/daboyz-rg",
  "location": "eastus",
  "managedBy": null,
  "name": "daboyz-rg",
  "properties": { "provisioningState": "Succeeded" },
  "tags": null,
  "type": "Microsoft.Resources/groups"
}
```

## Step 3: Deploy Infrastructure with Bicep

```powershell
# Navigate to repo root
cd c:\Users\Jack\Documents\git\daboyz-calender

# Deploy Bicep template
az deployment group create `
  --resource-group daboyz-rg `
  --template-file infra\main.bicep `
  --parameters infra\main.parameters.json
```

This command will:
1. Create Storage Account (for Table Storage)
2. Create DaboyzAvailability Table
3. Create Consumption-plan Functions App (auto-scales to 0)
4. Create Static Web App (Free tier)
5. Set up all connections

**Expected Duration:** 3-5 minutes

**Watch for completion:**
```
Deployment has completed successfully with status: Succeeded.
```

## Step 4: Retrieve Deployment Outputs

After deployment completes, get the outputs:

```powershell
# Get all output values
$outputs = az deployment group show `
  --resource-group daboyz-rg `
  --name main `
  --query 'properties.outputs' `
  -o json | ConvertFrom-Json

# Extract values
$storageConnectionString = $outputs.storageConnectionString.value
$functionAppName = $outputs.functionAppName.value
$staticWebAppUrl = $outputs.staticWebAppUrl.value
$storageAccountKey = $outputs.storageAccountKey.value

# Display for reference
Write-Output "Storage Connection String: $storageConnectionString"
Write-Output "Function App Name: $functionAppName"
Write-Output "Static Web App URL: $staticWebAppUrl"
```

**Save these values** - you'll need them for GitHub Secrets.

## Step 5: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Create the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Azure Portal (see Step 6) | Azure SWA properties |
| `STORAGE_ACCOUNT_NAME` | From deployment output | `storageAccountKey` part before `_` |
| `TABLE_STORAGE_CONNECTION_STRING` | From deployment output | `storageConnectionString` value |

## Step 6: Get Static Web Apps Deployment Token

1. Open Azure Portal: https://portal.azure.com
2. Find your Static Web App resource (search for "daboyz-app")
3. Go to **Manage deployment token**
4. Copy the deployment token
5. Add as GitHub Secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`

## Step 7: Update GitHub Repository URL in Bicep

Before deploying the frontend, update the repository URL in `infra/main.bicep`:

```bicep
repositoryUrl: 'https://github.com/YOUR_USERNAME/daboyz-calendar'
```

## Step 8: Deploy Frontend

Push your code to `main` branch:

```powershell
git add .
git commit -m "feat: prepare for Azure deployment"
git push origin main
```

GitHub Actions will automatically:
1. Build the app
2. Deploy to Azure Static Web Apps
3. Set up continuous deployment

**Check deployment status:**
- GitHub: Actions tab in your repository
- Azure Portal: Static Web App → Deployment history

## Step 9: Verify Deployment

After deployment completes (2-5 minutes):

1. **Visit your app:** Open the SWA URL from Step 4
2. **Test PersonaOnboarding:** Create a new persona with unique name/color
3. **Check availability:** Verify calendar displays correctly
4. **Monitor costs:** Azure Portal → Cost Management

## Cost Breakdown (Monthly Estimate)

| Service | Free Tier | Typical Usage | Cost |
|---------|-----------|---------------|------|
| Static Web Apps | Included | Unlimited | $0 |
| Azure Functions | 1M/month | ~240k requests | $0 (Free tier) |
| Table Storage | 5GB | ~1GB | $0 (Free tier) |
| **TOTAL** | | | **$0-$5** |

## Troubleshooting

### Issue: Deployment fails with "Resource already exists"
**Solution:** Unique names are auto-generated using `uniqueString()`. Try a different resource group name.

### Issue: Static Web App not updating after push
**Solution:** Check GitHub Actions tab for deployment errors. Verify GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` is set correctly.

### Issue: Functions endpoints return 404
**Solution:** Verify Azure Functions Core Tools is running locally. In production, Functions should be deployed via Bicep and GitHub Actions.

### Issue: Table Storage queries failing
**Solution:** Verify `TABLE_STORAGE_CONNECTION_STRING` is set in Functions app settings. Check Azure Portal → Function App → Configuration.

## Monitoring & Alerts

After deployment, set up cost alerts:

1. Azure Portal → Cost Management + Billing
2. Create alert if monthly cost exceeds $10
3. Set up Application Insights for function monitoring

## Rollback

If you need to rollback:

```powershell
# Delete entire resource group (deletes all resources)
az group delete --name daboyz-rg --yes --no-wait
```

This removes:
- Static Web App
- Functions App
- Storage Account
- All data

**Warning:** This action is permanent. Ensure data is backed up first.

## Success Checklist

- [ ] `az login` completed successfully
- [ ] Resource group created
- [ ] Bicep deployment completed
- [ ] All outputs captured
- [ ] GitHub Secrets configured
- [ ] Frontend deployed and accessible
- [ ] PersonaOnboarding tested
- [ ] Calendar functionality verified
- [ ] Cost alerts configured

## Next Steps

After successful deployment:

1. **Monitor performance:** Check Application Insights in Azure Portal
2. **Set up CI/CD:** Verify automatic deployments work on each `main` push
3. **Scale if needed:** Upgrade Storage to Standard-GRS for production backups
4. **Document:** Share production URL with team
5. **Backup:** Set up automatic table snapshots if needed

---

**Deployment Total Time:** 30-40 minutes  
**Estimated Cost:** $0-$5/month (within Free Tier)  
**Maintenance:** Automated via GitHub Actions
