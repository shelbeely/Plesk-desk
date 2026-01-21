# Plesk Desk - AI-first Plesk Assistant

An AI-first "Claude Code–style" assistant for Plesk that operates via its APIs with a beautiful CLI TUI interface.

## Features

- 🚀 **AI-Powered Operations**: Plan → Diff → Apply workflow with validation
- 🔄 **API Integration**: REST API with XML fallback for full coverage
- 🎨 **Interactive TUI**: Beautiful terminal interface built with Ink (React for CLI)
- ✅ **Validation & Rollback**: Safe operations with automatic rollback capability
- 🛡️ **Security First**: Secure API authentication with API keys or credentials

## Supported Operations

- **Domain Management**: Create, update, delete, and list domains
- **SSL Certificates**: Install and manage SSL certificates
- **PHP Settings**: Configure PHP versions and settings per domain
- **Reverse Proxy**: Configure reverse proxy settings for domains

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

```bash
export PLESK_HOST=your-plesk-server.com
export PLESK_PORT=8443                    # Optional, default: 8443
export PLESK_API_KEY=your-api-key         # Or use username/password
# OR
export PLESK_USERNAME=admin
export PLESK_PASSWORD=your-password
export PLESK_SECURE=true                  # Optional, default: true

# Security: Only set to false for development with self-signed certificates
# export PLESK_REJECT_UNAUTHORIZED=false
```

## Usage

### Demo Mode (Without TUI)

Run the demo to see the plan → diff → apply workflow in action:

```bash
npm run demo
```

This will demonstrate:
- Plan generation for domain operations
- Diff previews showing changes
- Operation validation
- Examples for SSL, PHP, and reverse proxy configuration

### CLI Mode (Interactive TUI)

```bash
npm run dev
# or after building:
npm start
```

**Note**: The TUI mode requires proper Plesk credentials. The demo mode can run without a Plesk server.

### Programmatic Usage

```typescript
import { PleskClient, AssistantEngine } from 'plesk-desk';

const client = new PleskClient({
  host: 'your-plesk-server.com',
  apiKey: 'your-api-key',
});

const assistant = new AssistantEngine(client);

// Generate a plan
const plan = await assistant.generatePlan('create-domain', {
  name: 'example.com',
});

// View the diff
const diff = await assistant.generateDiff('create-domain', {
  name: 'example.com',
});

// Apply the operation
const result = await assistant.applyOperation('create-domain', {
  name: 'example.com',
});

// Rollback if needed
if (!result.success) {
  await assistant.rollback();
}
```

## Architecture

### Plan → Diff → Apply Workflow

1. **Plan**: Generate a detailed plan showing all steps and risks
2. **Diff**: Preview exactly what will change
3. **Apply**: Execute the operation with validation
4. **Rollback**: Automatic rollback capability for reversible operations

### API Clients

- **REST Client**: Primary interface for modern Plesk operations
- **XML Client**: Fallback for full API coverage
- **Unified Client**: Automatically selects the best API method

## Development

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests (when available)
npm test
```

## API Documentation

- [Plesk REST API](https://docs.plesk.com/en-US/obsidian/api-rpc/about-rest-api.79359/)
- [Plesk XML API](https://docs.plesk.com/en-US/obsidian/api-rpc/about-xml-api.28709/)

## License

ISC