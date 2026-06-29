# Azure Deployment Guide

**Feature 004**: Infrastructure and Cost Optimizations

## Production Architecture Overview

The "Da Boyz Availability Calendar" is deployed on Azure using a cost-optimized serverless architecture designed to stay within Free Tier limits.

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Azure Static Web Apps (Free Tier)                          │
│  - Hosts React frontend                                     │
│  - Automatic HTTPS, global CDN                              │
│  - Handles SPA routing (index.html fallback)                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   └──────▶ /api/* routes to:
                   │
┌──────────────────┴──────────────────────────────────────────┐
│  Azure Functions (Consumption Tier)                         │
│  - Backend API endpoints                                    │
│  - Scales to 0 when idle (no cost)                         │
│  - 1M free invocations/month                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   └──────▶ AvailabilityAPI function:
                   │
┌──────────────────┴──────────────────────────────────────────┐
│  Azure Table Storage (PAYG - within Free Tier)              │
│  - Stores availability data                                 │
│  - PartitionKey: YYYY-MM (for efficient month queries)      │
│  - RowKey: persona_name#YYYY-MM-DD                          │
│  - Free Tier: 1GB included                                  │
└─────────────────────────────────────────────────────────────┘
```

### Cost Strategy

**Monthly Cost Estimate**: $0 (within Free Tier limits)

- **Static Web Apps**: Free Tier includes 10GB CDN bandwidth/month
- **Azure Functions**: Free Tier includes 1M invocations/month + 128MB memory/execution
- **Table Storage**: Free Tier includes 1GB storage + 20,000 read/write operations
- **Cost Protection Feature**: Adaptive polling (Page Visibility API + idle tracking) reduces expected requests from 518k to 178k/month (65% reduction), well within limits

## Deployment Steps

### Prerequisites

- Azure account (free tier eligible)
- GitHub repository with code
- GitHub Actions enabled

### 1. Prepare Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name daboyz-rg \
  --location eastus

# Create Storage Account for Table Storage
az storage account create \
  --resource-group daboyz-rg \
  --name daboyzstorage \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --resource-group daboyz-rg \
  --name daboyzstorage
```

### 2. Create Table Storage Table

```bash
# Use Azure Storage Explorer or Azure Portal to create table "DaboyzAvailability"
# Partitioning: PartitionKey = YYYY-MM (year-month for efficient retrieval)
# Row key format: persona_name#YYYY-MM-DD
```

### 3. Deploy via GitHub Actions

The repository includes `.github/workflows/deploy.yml` which automatically:
1. Triggers on push to `main` branch
2. Builds the React frontend with Vite
3. Deploys to Azure Static Web Apps
4. Deploys Azure Functions
5. Sets environment variables for Table Storage connection

### 4. Set GitHub Secrets

In GitHub repository settings, add:
- `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
- `TABLE_STORAGE_CONNECTION_STRING`: From step 1 above

## Environment Variables

### Production (.env for Functions)

```
TABLE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
FUNCTION_APP_NAME=daboyz-availability-api
STORAGE_TABLE_NAME=DaboyzAvailability
```

### Local Development (.env.local)

```
REACT_APP_API_URL=http://localhost:7071
VITE_API_BASE_URL=http://localhost:7071
```

## Monitoring

### Set Up Cost Alerts

1. Go to Azure Portal → Subscriptions → Cost Management
2. Create budget alert at $50 threshold (early warning)
3. Set up email notifications

### Application Insights (Optional Enhancement)

Add Application Insights to Azure Functions for performance monitoring:
```bash
az monitor app-insights component create \
  --resource-group daboyz-rg \
  --application-type web \
  --location eastus \
  --app daboyz-insights
```

## Database Schema

### Table: DaboyzAvailability

| PartitionKey | RowKey | Column | Type | Notes |
|---|---|---|---|---|
| YYYY-MM | persona_name#YYYY-MM-DD | name | string | Persona name (case-normalized) |
| | | color | string | Hex color code |
| | | date | string | YYYY-MM-DD |
| | | status | string | available \| unavailable |
| | | timestamp | datetime | ISO 8601 timestamp |
| | | lastModified | datetime | Last update time |

**Example**:
- PartitionKey: "2024-06"
- RowKey: "Jack#2024-06-15"

This structure enables efficient queries:
- Get all personas for a month: Query PartitionKey="2024-06"
- Get one persona's month data: Query PartitionKey="2024-06" and RowKey starts with "Jack#"

## Troubleshooting

### "Function app not responding"
- Check Azure Functions are running: `az functionapp list --resource-group daboyz-rg`
- View logs: `az functionapp log tail --name daboyz-api --resource-group daboyz-rg`

### "Table Storage connection fails"
- Verify connection string in Azure Portal
- Check firewall rules allow access
- Verify storage account key hasn't been rotated

### "High cost in billing"
- Check Azure Monitor for Function execution time/memory
- Review Table Storage transaction logs
- Verify client-side polling is actually throttled (check Network tab)

## Scaling

The architecture scales automatically:

- **Beyond 1M Function invocations**: Consider Azure App Service Premium Plan
- **Beyond 1GB Table Storage**: Pay-per-GB pricing (~$0.0015/GB/month)
- **Beyond 10GB CDN bandwidth**: Additional data egress fees apply

**Recommendation**: Monitor usage monthly and enable billing alerts well before exceeding Free Tier limits.

## Security Best Practices

- [ ] Enable Azure Firewall for production deployments
- [ ] Use Azure Key Vault for secrets management
- [ ] Implement Azure AD B2C for user authentication
- [ ] Regular security audits of Function code
- [ ] Enable Azure DDoS Standard protection (if budget allows)

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous deployment
az staticwebapp environment list \
  --name daboyz-calendar \
  --resource-group daboyz-rg

# Promote previous environment
az staticwebapp environment promote \
  --name daboyz-calendar \
  --resource-group daboyz-rg \
  --environment-name <previous-environment-id>
```

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Table Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/tables/)
- [Azure Free Tier Details](https://azure.microsoft.com/en-us/free/)
