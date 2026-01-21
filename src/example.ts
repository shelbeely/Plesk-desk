import { PleskClient, AssistantEngine } from './index';

// Example usage
async function main() {
  // Create a Plesk client
  const client = new PleskClient({
    host: 'plesk.example.com',
    apiKey: 'your-api-key',
    secure: true,
  });

  // Create assistant engine
  const assistant = new AssistantEngine(client);

  // Example 1: List domains
  try {
    console.log('Fetching domains...');
    const domains = await client.listDomains();
    console.log(`Found ${domains.length} domains:`, domains);
  } catch (error) {
    console.error('Error listing domains:', error);
  }

  // Example 2: Plan an operation
  try {
    console.log('\nGenerating plan for creating a domain...');
    const plan = await assistant.generatePlan('create-domain', {
      name: 'example.com',
    });
    console.log('Operation:', plan.operation);
    console.log('Description:', plan.description);
    console.log('Steps:', plan.steps);
    console.log('Risks:', plan.risks);
  } catch (error) {
    console.error('Error generating plan:', error);
  }

  // Example 3: Generate diff
  try {
    console.log('\nGenerating diff for domain creation...');
    const diff = await assistant.generateDiff('create-domain', {
      name: 'example.com',
    });
    console.log('Changes:', diff.changes);
  } catch (error) {
    console.error('Error generating diff:', error);
  }

  // Example 4: Validate operation
  try {
    console.log('\nValidating operation...');
    const validation = await assistant.validateOperation('create-domain', {
      name: 'example.com',
    });
    console.log('Valid:', validation.valid);
    if (!validation.valid) {
      console.log('Errors:', validation.errors);
    }
  } catch (error) {
    console.error('Error validating operation:', error);
  }

  // Note: Uncomment to actually apply the operation
  /*
  // Example 5: Apply operation
  try {
    console.log('\nApplying operation...');
    const result = await assistant.applyOperation('create-domain', {
      name: 'example.com',
    });
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    // If something goes wrong, rollback
    if (!result.success) {
      console.log('Rolling back...');
      const rollbackResult = await assistant.rollback();
      console.log('Rollback result:', rollbackResult);
    }
  } catch (error) {
    console.error('Error applying operation:', error);
  }
  */
}

// Run the example if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
