import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { PleskClient } from '../../api/client';
import { AssistantEngine } from '../../core/assistant';

interface ProxyManagerProps {
  client: PleskClient;
  assistant: AssistantEngine;
  onBack: () => void;
}

export const ProxyManager: React.FC<ProxyManagerProps> = ({ client, assistant, onBack }) => {
  const [message, setMessage] = useState<string>('');

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🔄 Reverse Proxy Configuration
        </Text>
      </Box>
      {message && (
        <Box marginBottom={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}
      <Box marginBottom={1}>
        <Text>Configure reverse proxy settings for your domains</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Features:</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text>• Forward requests to backend servers</Text>
          <Text>• Load balancing support</Text>
          <Text>• WebSocket proxying</Text>
          <Text>• Custom headers</Text>
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          ESC/q=Back
        </Text>
      </Box>
    </Box>
  );
};
