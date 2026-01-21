import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { DomainManager } from './components/DomainManager';
import { SSLManager } from './components/SSLManager';
import { PHPManager } from './components/PHPManager';
import { ProxyManager } from './components/ProxyManager';
import { PleskClient } from '../api/client';
import { AssistantEngine } from '../core/assistant';

interface AppProps {
  client: PleskClient;
}

export const App: React.FC<AppProps> = ({ client }) => {
  const [screen, setScreen] = useState<'menu' | 'domains' | 'ssl' | 'php' | 'proxy'>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { exit } = useApp();

  const assistant = new AssistantEngine(client);

  const menuItems = [
    { label: 'Domain Management', screen: 'domains' as const },
    { label: 'SSL Certificates', screen: 'ssl' as const },
    { label: 'PHP Settings', screen: 'php' as const },
    { label: 'Reverse Proxy', screen: 'proxy' as const },
    { label: 'Exit', screen: 'exit' as const },
  ];

  useInput((input, key) => {
    if (screen === 'menu') {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(menuItems.length - 1, prev + 1));
      } else if (key.return) {
        const selected = menuItems[selectedIndex];
        if (selected.screen === 'exit') {
          exit();
        } else {
          setScreen(selected.screen);
        }
      }
    } else if (key.escape || input === 'q') {
      setScreen('menu');
      setSelectedIndex(0);
    }
  });

  if (screen === 'menu') {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            🚀 Plesk AI Assistant
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            Select an option to manage your Plesk server:
          </Text>
        </Box>
        {menuItems.map((item, index) => (
          <Box key={index}>
            <Text color={selectedIndex === index ? 'green' : 'white'}>
              {selectedIndex === index ? '► ' : '  '}
              {item.label}
            </Text>
          </Box>
        ))}
        <Box marginTop={1}>
          <Text dimColor>
            Use ↑/↓ to navigate, Enter to select, ESC/q to go back
          </Text>
        </Box>
      </Box>
    );
  }

  if (screen === 'domains') {
    return <DomainManager client={client} assistant={assistant} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'ssl') {
    return <SSLManager client={client} assistant={assistant} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'php') {
    return <PHPManager client={client} assistant={assistant} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'proxy') {
    return <ProxyManager client={client} assistant={assistant} onBack={() => setScreen('menu')} />;
  }

  return null;
};
