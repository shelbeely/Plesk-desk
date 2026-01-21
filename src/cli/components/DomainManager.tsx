import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { PleskClient } from '../../api/client';
import { AssistantEngine } from '../../core/assistant';
import { PleskDomain, OperationPlan, OperationDiff } from '../../types';

interface DomainManagerProps {
  client: PleskClient;
  assistant: AssistantEngine;
  onBack: () => void;
}

export const DomainManager: React.FC<DomainManagerProps> = ({ client, assistant, onBack }) => {
  const [domains, setDomains] = useState<PleskDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'list' | 'plan' | 'diff' | 'apply'>('list');
  const [plan, setPlan] = useState<OperationPlan | null>(null);
  const [diff, setDiff] = useState<OperationDiff | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const data = await client.listDomains();
      setDomains(data);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  useInput((input, key) => {
    if (mode === 'list') {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(domains.length - 1, prev + 1));
      } else if (input === 'p') {
        // Generate plan
        handleGeneratePlan();
      } else if (input === 'r') {
        loadDomains();
      } else if (key.escape || input === 'q') {
        onBack();
      }
    } else if (mode === 'plan') {
      if (input === 'd') {
        handleGenerateDiff();
      } else if (key.escape || input === 'q') {
        setMode('list');
      }
    } else if (mode === 'diff') {
      if (input === 'a') {
        handleApply();
      } else if (key.escape || input === 'q') {
        setMode('list');
      }
    }
  });

  const handleGeneratePlan = async () => {
    if (domains.length === 0) return;
    
    setLoading(true);
    try {
      // Example: generate a plan to check domain
      const generatedPlan = await assistant.generatePlan('create-domain', {
        name: 'example.com',
      });
      setPlan(generatedPlan);
      setMode('plan');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleGenerateDiff = async () => {
    if (!plan) return;
    
    setLoading(true);
    try {
      const generatedDiff = await assistant.generateDiff('create-domain', {
        name: 'example.com',
      });
      setDiff(generatedDiff);
      setMode('diff');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!diff) return;
    
    setLoading(true);
    try {
      const result = await assistant.applyOperation('create-domain', {
        name: 'example.com',
      });
      setMessage(result.message);
      setMode('list');
      await loadDomains();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  if (loading && mode === 'list') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Loading domains...
        </Text>
      </Box>
    );
  }

  if (mode === 'list') {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            📋 Domain Management
          </Text>
        </Box>
        {message && (
          <Box marginBottom={1}>
            <Text color="yellow">{message}</Text>
          </Box>
        )}
        {domains.length === 0 ? (
          <Text>No domains found</Text>
        ) : (
          domains.map((domain, index) => (
            <Box key={domain.id || index}>
              <Text color={selectedIndex === index ? 'green' : 'white'}>
                {selectedIndex === index ? '► ' : '  '}
                {domain.name} - {domain.status}
              </Text>
            </Box>
          ))
        )}
        <Box marginTop={1}>
          <Text dimColor>
            p=Plan | r=Refresh | ESC/q=Back
          </Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'plan' && plan) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            📝 Operation Plan: {plan.operation}
          </Text>
        </Box>
        <Box marginBottom={1}>
          <Text>{plan.description}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text bold>Steps:</Text>
        </Box>
        {plan.steps.map((step, index) => (
          <Box key={index} marginLeft={2}>
            <Text>
              {index + 1}. {step.description} {step.reversible ? '✓' : '⚠️'}
            </Text>
          </Box>
        ))}
        <Box marginTop={1} marginBottom={1}>
          <Text bold color="yellow">Risks:</Text>
        </Box>
        {plan.risks.map((risk, index) => (
          <Box key={index} marginLeft={2}>
            <Text color="yellow">• {risk}</Text>
          </Box>
        ))}
        <Box marginTop={1}>
          <Text dimColor>
            d=Show Diff | ESC/q=Back
          </Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'diff' && diff) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="cyan">
            🔍 Changes Preview
          </Text>
        </Box>
        {diff.changes.map((change, index) => (
          <Box key={index} flexDirection="column" marginBottom={1}>
            <Text bold>{change.field}:</Text>
            <Box marginLeft={2}>
              <Text color="red">- {JSON.stringify(change.oldValue)}</Text>
            </Box>
            <Box marginLeft={2}>
              <Text color="green">+ {JSON.stringify(change.newValue)}</Text>
            </Box>
          </Box>
        ))}
        <Box marginTop={1}>
          <Text dimColor>
            a=Apply | ESC/q=Back
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};
