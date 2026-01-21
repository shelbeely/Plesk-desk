import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { PleskClient } from '../../api/client';
import { AssistantEngine } from '../../core/assistant';
import { PleskSSLCertificate, OperationPlan } from '../../types';

interface SSLManagerProps {
  client: PleskClient;
  assistant: AssistantEngine;
  onBack: () => void;
}

export const SSLManager: React.FC<SSLManagerProps> = ({ client, assistant, onBack }) => {
  const [certificates, setCertificates] = useState<PleskSSLCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await client.listSSLCertificates();
      setCertificates(data);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(certificates.length - 1, prev + 1));
    } else if (input === 'r') {
      loadCertificates();
    } else if (key.escape || input === 'q') {
      onBack();
    }
  });

  if (loading) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Loading SSL certificates...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🔒 SSL Certificate Management
        </Text>
      </Box>
      {message && (
        <Box marginBottom={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}
      {certificates.length === 0 ? (
        <Text>No SSL certificates found</Text>
      ) : (
        certificates.map((cert, index) => (
          <Box key={cert.id || index} flexDirection="column" marginBottom={1}>
            <Text color={selectedIndex === index ? 'green' : 'white'}>
              {selectedIndex === index ? '► ' : '  '}
              {cert.name} ({cert.domain})
            </Text>
            <Box marginLeft={4}>
              <Text dimColor>
                Valid: {new Date(cert.validFrom).toLocaleDateString()} - {new Date(cert.validTo).toLocaleDateString()}
              </Text>
            </Box>
          </Box>
        ))
      )}
      <Box marginTop={1}>
        <Text dimColor>
          r=Refresh | ESC/q=Back
        </Text>
      </Box>
    </Box>
  );
};
