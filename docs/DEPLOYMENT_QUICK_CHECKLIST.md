# Azure Deployment Quick Checklist - Feature 004

**Status:** Ready for Production Deployment  
**Date:** 2026-06-29  
**Estimated Time:** 30-40 minutes  
**Estimated Cost:** $0-$5/month (Free Tier)

## Phase 1: Azure Authentication & Setup (5 min)

- [ ] Run `az login` in PowerShell
- [ ] Verify authentication with `az account list --output table`
- [ ] Note your Subscription ID
- [ ] Set default subscription: `az account set --subscription "YOUR_SUBSCRIPTION_ID"`

## Phase 2: Resource Deployment (10 min)

- [ ] Run: `az group create --name daboyz-rg --location eastus`
- [ ] Run: `az deployment group create --resource-group daboyz-rg --template-file infra\main.bicep --parameters infra\main.parameters.json`
- [ ] Wait for "Deployment has completed successfully"
- [ ] Save deployment outputs (see DEPLOYMENT_GUIDE.md Step 4)

**Outputs to Save:**
```
[ ] Storage Connection String
[ ] Function App Name
[ ] Static Web App URL
[ ] Storage Account Key
```

## Phase 3: GitHub Configuration (5 min)

- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Create secret: `AZURE_STATIC_WEB_APPS_API_TOKEN` (from Azure Portal SWA)
- [ ] Create secret: `STORAGE_ACCOUNT_NAME`
- [ ] Create secret: `TABLE_STORAGE_CONNECTION_STRING`

## Phase 4: Deployment (5 min)

- [ ] Update `infra/main.bicep` with your GitHub repo URL
- [ ] Commit: `git add . && git commit -m "feat: prepare for Azure deployment"`
- [ ] Push: `git push origin main`
- [ ] GitHub Actions automatically builds and deploys

## Phase 5: Verification (5 min)

- [ ] GitHub Actions completes successfully
- [ ] Visit Static Web App URL
- [ ] Test PersonaOnboarding form
- [ ] Verify calendar displays
- [ ] Check Azure Portal for $0 estimated cost

## Deployment Commands Reference

```powershell
# 1. Authenticate
az login

# 2. Create resource group
az group create --name daboyz-rg --location eastus

# 3. Deploy infrastructure
az deployment group create `
  --resource-group daboyz-rg `
  --template-file infra\main.bicep `
  --parameters infra\main.parameters.json

# 4. Get outputs
az deployment group show `
  --resource-group daboyz-rg `
  --name main `
  --query 'properties.outputs' `
  -o json

# 5. Monitor deployment
az deployment group list --resource-group daboyz-rg --query "[].{name:name, state:properties.provisioningState}" -o table

# 6. Cleanup (if needed)
az group delete --name daboyz-rg --yes --no-wait
```

## Cost Monitoring

```powershell
# Check current costs
az costmanagement query --resource-group daboyz-rg

# Set spending limit in Azure Portal: $10/month
```

## Success Indicators

✅ **Expected Results After Deployment:**
- Static Web App URL accessible (e.g., `https://daboyz-app-abc123.azurestaticapps.net`)
- PersonaOnboarding form creates personas
- Calendar displays availability correctly
- All data stored in Table Storage
- Functions auto-scale to 0 when idle
- GitHub Actions runs on every push to main
- Monthly cost: $0-$5 (within Free Tier)

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| `az login` not working | [See DEPLOYMENT_GUIDE.md Step 1](./DEPLOYMENT_GUIDE.md) |
| Bicep deployment fails | Check resource group exists: `az group show --name daboyz-rg` |
| GitHub Actions fails | Check secrets: Settings → Secrets and variables → Actions |
| Static Web App 404 | Verify `app_location: "public/dist"` in workflow |
| Functions endpoints error | Check `TABLE_STORAGE_CONNECTION_STRING` in Functions config |

## Next Steps After Deployment

1. **Monitor:** Check Azure Portal every few days for cost updates
2. **Alert:** Set up spending alert for $20/month (2x expected)
3. **Backup:** Document final production URL
4. **Test:** Verify all features work in production
5. **Team:** Share access with team members via Azure Portal

## Rollback Plan

If deployment fails critically:

```powershell
# Delete everything (WARNING: Deletes all data!)
az group delete --name daboyz-rg --yes --no-wait
```

Then start over with Phase 1.

---

**Questions or Issues?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.
