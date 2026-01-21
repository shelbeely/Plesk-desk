#!/usr/bin/env node
/**
 * Demo script showing the plan -> diff -> apply workflow
 * This demonstrates the core functionality without the TUI
 */

import { PleskClient } from './api/client';
import { AssistantEngine } from './core/assistant';

async function runDemo() {
  const config = {
    host: process.env.PLESK_HOST || 'plesk.example.com',
    port: parseInt(process.env.PLESK_PORT || '8443'),
    apiKey: process.env.PLESK_API_KEY,
    username: process.env.PLESK_USERNAME,
    password: process.env.PLESK_PASSWORD,
    secure: process.env.PLESK_SECURE !== 'false',
  };

  console.log('🚀 Plesk AI Assistant Demo\n');
  console.log(`Connecting to: ${config.host}:${config.port}\n`);

  const client = new PleskClient(config);
  const assistant = new AssistantEngine(client);

  // Demo 1: Generate a plan
  console.log('📝 Step 1: Generate Plan');
  console.log('═'.repeat(50));
  const plan = await assistant.generatePlan('create-domain', {
    name: 'example.com',
  });

  console.log(`Operation: ${plan.operation}`);
  console.log(`Description: ${plan.description}\n`);
  console.log('Steps:');
  plan.steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step.description} ${step.reversible ? '✓ reversible' : '⚠️  not reversible'}`);
  });
  console.log('\nRisks:');
  plan.risks.forEach(risk => {
    console.log(`  • ${risk}`);
  });

  // Demo 2: Generate diff
  console.log('\n\n🔍 Step 2: Generate Diff');
  console.log('═'.repeat(50));
  const diff = await assistant.generateDiff('create-domain', {
    name: 'example.com',
  });

  console.log('Changes:');
  diff.changes.forEach(change => {
    console.log(`  ${change.field}:`);
    console.log(`    - Old: ${JSON.stringify(change.oldValue)}`);
    console.log(`    + New: ${JSON.stringify(change.newValue)}`);
  });

  // Demo 3: Validate
  console.log('\n\n✅ Step 3: Validate Operation');
  console.log('═'.repeat(50));
  const validation = await assistant.validateOperation('create-domain', {
    name: 'example.com',
  });

  console.log(`Valid: ${validation.valid}`);
  if (!validation.valid) {
    console.log('Errors:');
    validation.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }

  console.log('\n\n💡 Additional Examples');
  console.log('═'.repeat(50));

  // Example: SSL installation plan
  const sslPlan = await assistant.generatePlan('install-ssl', {
    domain: 'example.com',
    certificate: { name: 'example-cert' },
  });
  console.log(`\nSSL Installation: ${sslPlan.description}`);
  console.log(`Steps: ${sslPlan.steps.length}, Risks: ${sslPlan.risks.length}`);

  // Example: PHP update plan
  const phpPlan = await assistant.generatePlan('update-php', {
    domain: 'example.com',
    settings: { version: '8.2' },
  });
  console.log(`\nPHP Update: ${phpPlan.description}`);
  console.log(`Steps: ${phpPlan.steps.length}, Risks: ${phpPlan.risks.length}`);

  // Example: Reverse proxy plan
  const proxyPlan = await assistant.generatePlan('configure-proxy', {
    domain: 'example.com',
    config: { targetUrl: 'http://localhost:3000' },
  });
  console.log(`\nReverse Proxy: ${proxyPlan.description}`);
  console.log(`Steps: ${proxyPlan.steps.length}, Risks: ${proxyPlan.risks.length}`);

  console.log('\n\n✨ Demo Complete!');
  console.log('═'.repeat(50));
  console.log('To apply changes, set APPLY=true environment variable');
  console.log('Note: Actual API calls are mocked in this demo');
}

runDemo().catch(console.error);
