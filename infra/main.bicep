param location string = 'eastus2'
param environment string = 'prod'
param projectName string = 'daboyz'

// Ensure globally unique names (keep short for storage account 24 char limit)
var storageAccountName = '${projectName}stg${uniqueString(resourceGroup().id)}'
var functionAppName = '${projectName}-api-${uniqueString(resourceGroup().id)}'
var staticWebAppName = '${projectName}-app-${uniqueString(resourceGroup().id)}'
var tableName = 'DaboyzAvailability'

// Storage Account (for Table Storage and Function runtime)
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'  // Lowest cost: locally redundant
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

// Table Storage for availability data
resource table 'Microsoft.Storage/storageAccounts/tableServices/tables@2021-09-01' = {
  name: '${storageAccount.name}/default/${tableName}'
}

// Static Web App resource
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'  // Free tier SWA
    tier: 'Free'
  }
  properties: {
    provider: 'GitHub'
    repositoryUrl: 'https://github.com/beegul/daboyz-calendar'
    branch: 'main'
    buildProperties: {
      appLocation: 'public'
      apiLocation: 'api'
      outputLocation: 'dist'
    }
  }
}

// App Service Plan for Functions (Consumption plan = pay per execution)
// NOTE: Temporarily commented out due to Free Trial VM quota limits
// This can be enabled after requesting quota increase from Azure Support
// resource functionAppServicePlan 'Microsoft.Web/serverfarms@2021-03-01' = {
//   name: '${functionAppName}-plan'
//   location: location
//   sku: {
//     name: 'Y1'  // Consumption plan: $0.20 per million executions
//     tier: 'Dynamic'
//   }
//   properties: {}
// }

// Azure Functions (Consumption Tier = Auto-scales to 0)
// NOTE: Temporarily commented out - deploy via SWA API functions instead
// resource functionApp 'Microsoft.Web/sites@2021-03-01' = {
//   name: functionAppName
//   location: location
//   kind: 'functionapp'
//   identity: {
//     type: 'SystemAssigned'
//   }
//   properties: {
//     serverFarmId: functionAppServicePlan.id
//     siteConfig: {
//       appSettings: [
//         {
//           name: 'AzureWebJobsStorage'
//           value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-09-01').keys[0].value};EndpointSuffix=core.windows.net'
//         }
//         {
//           name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
//           value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-09-01').keys[0].value};EndpointSuffix=core.windows.net'
//         }
//         {
//           name: 'WEBSITE_CONTENTSHARE'
//           value: toLower('${functionAppName}-content')
//         }
//         {
//           name: 'FUNCTIONS_EXTENSION_VERSION'
//           value: '~4'  // Functions runtime v4
//         }
//         {
//           name: 'FUNCTIONS_WORKER_RUNTIME'
//           value: 'node'
//         }
//         {
//           name: 'TABLE_STORAGE_CONNECTION_STRING'
//           value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-09-01').keys[0].value};EndpointSuffix=core.windows.net'
//         }
//       ]
//       ftpsState: 'FtpsOnly'
//       minTlsVersion: '1.2'
//     }
//     httpsOnly: true
//   }
// }

// Log Analytics for monitoring (optional, minimal cost)
// Disabled for free tier to avoid quota issues
// Uncomment below when quota is increased
/*
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-06-01' = {
  name: '${projectName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}
*/

// Outputs for deployment
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output storageConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2021-09-01').keys[0].value};EndpointSuffix=core.windows.net'
output storageAccountName string = storageAccount.name
output tableName string = tableName
output storageAccountKey string = listKeys(storageAccount.id, '2021-09-01').keys[0].value
