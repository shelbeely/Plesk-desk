#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App';
import { PleskClient } from '../api/client';
import { PleskConfig } from '../types';

// Load configuration from environment variables or command line
const config: PleskConfig = {
  host: process.env.PLESK_HOST || 'localhost',
  port: parseInt(process.env.PLESK_PORT || '8443'),
  username: process.env.PLESK_USERNAME,
  password: process.env.PLESK_PASSWORD,
  apiKey: process.env.PLESK_API_KEY,
  secure: process.env.PLESK_SECURE !== 'false',
};

// Validate configuration
if (!config.host) {
  console.error('Error: PLESK_HOST environment variable is required');
  process.exit(1);
}

if (!config.apiKey && (!config.username || !config.password)) {
  console.error('Error: Either PLESK_API_KEY or PLESK_USERNAME/PLESK_PASSWORD is required');
  process.exit(1);
}

// Create Plesk client
const client = new PleskClient(config);

// Render the app
render(<App client={client} />);
