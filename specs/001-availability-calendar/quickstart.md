# Quickstart: Shared Availability Calendar (Azure Stack)

## Prerequisites

**Local Development**:
- Node.js 18+ and npm
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools`)
- Python 3.11+ (for local backend development)
- Azure CLI (for cloud deployment)

**Azure Resources** (for production):
- Azure Static Web Apps resource (Free Tier)
- Azure Function App (Consumption Tier)
- Azure Storage Account (for Table Storage)

## Local Development Setup

### 1. Install Dependencies

```bash
# Frontend
cd public/
npm install

# Backend
cd ../api/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start Local Dev Environment

**Terminal 1 - Frontend** (Vite dev server on port 5173):
```bash
cd public/
npm run dev
```

**Terminal 2 - Backend** (Azure Functions on port 7071):
```bash
cd api/
func start
```

### 3. Open Browser

Navigate to `http://localhost:5173/`

## Validate Features Locally

1. **User Identity**: Verify the user selector loads with default users (Alice, Bobby, Carmen)
2. **Mark Availability**: Click a date and confirm the user's availability marker appears
3. **Multi-User View**: Switch users and mark the same date; verify both users appear
4. **Month Navigation**: Use Previous/Next buttons to navigate between months
5. **Cross-Device Sync**: Open app in another browser tab/device and verify real-time updates (if connected to backend)
6. **API Health**: Check `http://localhost:7071/api/users` returns user list

## Azure Deployment

### 1. Create Azure Resources

```bash
az login
az group create --name daboyz-calendar --location eastus

# Create Storage Account
az storage account create --resource-group daboyz-calendar \
  --name daboyzstg --sku Standard_LRS

# Create Function App
az functionapp create --resource-group daboyz-calendar \
  --consumption-plan-location eastus --runtime python --runtime-version 3.11 \
  --functions-version 4 --name daboyz-functions

# Create Static Web App
az staticwebapp create --resource-group daboyz-calendar \
  --name daboyz-calendar --location eastus
```

### 2. Configure Static Web Apps

Update `staticwebapp.config.json` in the repo root:

```json
{
  "routes": [
    {
      "route": "/api/*",
      "methods": ["GET", "POST", "DELETE"],
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

### 3. Deploy Frontend

```bash
cd public/
npm run build
az staticwebapp deploy --name daboyz-calendar --source-location dist
```

### 4. Deploy Backend

```bash
cd api/
func azure functionapp publish daboyz-functions
```

### 5. Verify Deployment

Access the app at `https://<static-app-name>.azurestaticapps.net/`

## Expected Outcomes

- React app loads with full calendar UI in <2 seconds
- User availability toggles reflected instantly (< 100ms)
- Cross-device sync works when connected to backend
- Monthly storage cost < $1 for small friend groups
- All functionality accessible without authentication

## Future Enhancements

- Add Azure AD for multi-tenant support
- Implement WebSocket real-time sync (upgrade from polling)
- Archive historical calendar data to Blob Storage
- Add analytics via Application Insights