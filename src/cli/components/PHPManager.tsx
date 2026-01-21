import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { PleskClient } from '../../api/client';
import { AssistantEngine } from '../../core/assistant';

interface PHPManagerProps {
  client: PleskClient;
  assistant: AssistantEngine;
  onBack: () => void;
}

export const PHPManager: React.FC<PHPManagerProps> = ({ client, assistant, onBack }) => {
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
          🐘 PHP Settings Management
        </Text>
      </Box>
      {message && (
        <Box marginBottom={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}
      <Box marginBottom={1}>
        <Text>Select a domain to manage PHP settings</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Available PHP versions:</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text>• PHP 7.4</Text>
          <Text>• PHP 8.0</Text>
          <Text>• PHP 8.1</Text>
          <Text>• PHP 8.2</Text>
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
