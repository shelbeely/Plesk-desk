# Plesk Desk - Usage Guide

## Quick Start

### 1. Installation

```bash
npm install
npm run build
```

### 2. Configuration

Create a `.env` file (or use environment variables):

```bash
cp .env.example .env
# Edit .env with your Plesk server details
```

### 3. Run Demo

```bash
npm run demo
```

## Features

### Plan → Diff → Apply Workflow

The assistant follows a safe, three-step workflow:

1. **Plan**: Generate a detailed execution plan
2. **Diff**: Preview exactly what will change
3. **Apply**: Execute with validation and rollback support

### Supported Operations

#### Domain Management
- Create new domains
- Update domain settings
- Delete domains
- List all domains

#### SSL Certificates
- Install SSL certificates
- List installed certificates
- Configure automatic SSL

#### PHP Settings
- Change PHP version per domain
- Update PHP configuration
- Manage PHP extensions

#### Reverse Proxy
- Configure reverse proxy rules
- Set up load balancing
- Manage WebSocket proxying

## API Examples

### Domain Operations

```typescript
import { PleskClient, AssistantEngine } from 'plesk-desk';

const client = new PleskClient({
  host: 'your-plesk-server.com',
  apiKey: 'your-api-key',
});

const assistant = new AssistantEngine(client);

// List domains
const domains = await client.listDomains();

// Plan domain creation
const plan = await assistant.generatePlan('create-domain', {
  name: 'example.com',
});

// Preview changes
const diff = await assistant.generateDiff('create-domain', {
  name: 'example.com',
});

// Apply operation
const result = await assistant.applyOperation('create-domain', {
  name: 'example.com',
});

// Rollback if needed
if (!result.success) {
  await assistant.rollback();
}
```

### SSL Certificate Installation

```typescript
// Generate SSL plan
const sslPlan = await assistant.generatePlan('install-ssl', {
  domainId: 123,
  certificate: {
    name: 'my-cert',
    cert: '-----BEGIN CERTIFICATE-----...',
    ca: '-----BEGIN CERTIFICATE-----...',
  },
});

// Preview changes
const sslDiff = await assistant.generateDiff('install-ssl', {
  domainId: 123,
  certificate: { ... },
});

// Apply SSL installation
const result = await assistant.applyOperation('install-ssl', {
  domainId: 123,
  certificate: { ... },
});
```

### PHP Settings Update

```typescript
// Update PHP version
const phpPlan = await assistant.generatePlan('update-php', {
  domainId: 123,
  settings: {
    version: '8.2',
    'memory_limit': '256M',
    'max_execution_time': '300',
  },
});

// Apply PHP settings
const result = await assistant.applyOperation('update-php', {
  domainId: 123,
  settings: { ... },
});
```

### Reverse Proxy Configuration

```typescript
// Configure reverse proxy
const proxyPlan = await assistant.generatePlan('configure-proxy', {
  domainId: 123,
  config: {
    targetUrl: 'http://localhost:3000',
    preserveHost: true,
    timeout: 60,
  },
});

// Apply proxy configuration
const result = await assistant.applyOperation('configure-proxy', {
  domainId: 123,
  config: { ... },
});
```

## CLI TUI Navigation

When running `npm run dev`:

- **↑/↓**: Navigate menu items
- **Enter**: Select option
- **ESC/q**: Go back or exit
- **p**: Generate plan (in list views)
- **d**: Show diff (after plan)
- **a**: Apply changes (after diff review)
- **r**: Refresh list

## Architecture

### API Clients

The system uses a layered API approach:

1. **REST Client** (`PleskRestClient`): Primary interface for modern Plesk versions
2. **XML Client** (`PleskXmlClient`): Fallback for full API coverage
3. **Unified Client** (`PleskClient`): Automatically selects best method

### Assistant Engine

The `AssistantEngine` class provides:

- Operation planning with risk assessment
- Change preview (diff generation)
- Validation before execution
- Automatic rollback capability
- Operation history tracking

### Workflow States

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Plan   │ --> │   Diff   │ --> │ Validate │ --> │  Apply   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                                                          v
                                                    ┌──────────┐
                                                    │ Rollback │
                                                    └──────────┘
```

## Error Handling

All operations include comprehensive error handling:

```typescript
try {
  const result = await assistant.applyOperation('create-domain', params);
  
  if (!result.success) {
    console.error('Operation failed:', result.message);
    console.error('Errors:', result.errors);
    
    // Attempt rollback
    const rollback = await assistant.rollback();
    console.log('Rollback:', rollback.message);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Security Best Practices

1. **Use API Keys**: Prefer API keys over username/password
2. **Environment Variables**: Never commit credentials to git
3. **HTTPS Only**: Always use secure connections (default)
4. **Validate Input**: The assistant validates all operations before applying
5. **Review Plans**: Always review the plan and diff before applying changes

## Troubleshooting

### Connection Issues

```bash
# Test connection
curl -k https://your-plesk-server:8443/api/v2/server

# Check credentials
echo "PLESK_HOST=..." >> .env
echo "PLESK_API_KEY=..." >> .env
```

### API Errors

- **401 Unauthorized**: Check API key or credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Server Error**: Check Plesk server logs

### TUI Issues

If the TUI doesn't start properly, use the demo mode:

```bash
npm run demo
```

## Contributing

Contributions are welcome! Please:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## License

ISC
