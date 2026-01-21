import { OperationPlan, OperationDiff, OperationResult, Change } from '../types';
import { PleskClient } from '../api/client';

export class AssistantEngine {
  private client: PleskClient;
  private rollbackStack: Array<{ operation: string; data: any }> = [];

  constructor(client: PleskClient) {
    this.client = client;
  }

  /**
   * Generate a plan for an operation
   */
  async generatePlan(operation: string, params: any): Promise<OperationPlan> {
    const plans: Record<string, (params: any) => OperationPlan> = {
      'create-domain': (p) => ({
        operation: 'create-domain',
        description: `Create new domain: ${p.name}`,
        steps: [
          { action: 'validate', description: 'Validate domain name format', reversible: true },
          { action: 'check-existence', description: 'Check if domain already exists', reversible: true },
          { action: 'create', description: 'Create domain in Plesk', reversible: true },
          { action: 'configure', description: 'Apply initial configuration', reversible: true },
        ],
        risks: ['Domain creation cannot be undone easily', 'DNS propagation may take time'],
      }),
      'delete-domain': (p) => ({
        operation: 'delete-domain',
        description: `Delete domain: ${p.name}`,
        steps: [
          { action: 'backup', description: 'Backup domain configuration', reversible: false },
          { action: 'validate', description: 'Validate domain exists', reversible: true },
          { action: 'delete', description: 'Delete domain from Plesk', reversible: false },
        ],
        risks: ['Data loss - backups recommended', 'Cannot be easily reversed'],
      }),
      'install-ssl': (p) => ({
        operation: 'install-ssl',
        description: `Install SSL certificate for: ${p.domain}`,
        steps: [
          { action: 'validate-cert', description: 'Validate certificate format', reversible: true },
          { action: 'backup-current', description: 'Backup current SSL config', reversible: false },
          { action: 'install', description: 'Install new certificate', reversible: true },
          { action: 'test', description: 'Test SSL configuration', reversible: true },
        ],
        risks: ['Incorrect certificate can break HTTPS', 'Visitors may see security warnings'],
      }),
      'update-php': (p) => ({
        operation: 'update-php',
        description: `Update PHP settings for: ${p.domain}`,
        steps: [
          { action: 'backup-settings', description: 'Backup current PHP settings', reversible: false },
          { action: 'validate', description: 'Validate new settings', reversible: true },
          { action: 'apply', description: 'Apply PHP settings', reversible: true },
          { action: 'restart', description: 'Restart PHP-FPM if needed', reversible: true },
        ],
        risks: ['Incompatible settings may break site', 'Version changes can affect functionality'],
      }),
      'configure-proxy': (p) => ({
        operation: 'configure-proxy',
        description: `Configure reverse proxy for: ${p.domain}`,
        steps: [
          { action: 'validate-target', description: 'Validate target URL', reversible: true },
          { action: 'backup-config', description: 'Backup current proxy config', reversible: false },
          { action: 'configure', description: 'Apply proxy configuration', reversible: true },
          { action: 'test', description: 'Test proxy connection', reversible: true },
        ],
        risks: ['Misconfiguration can make site unreachable', 'Target must be accessible'],
      }),
    };

    const planGenerator = plans[operation];
    if (!planGenerator) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    return planGenerator(params);
  }

  /**
   * Generate a diff showing what will change
   */
  async generateDiff(operation: string, params: any): Promise<OperationDiff> {
    const changes: Change[] = [];
    let before: any = null;
    let after: any = null;

    try {
      switch (operation) {
        case 'create-domain':
          before = null;
          after = { name: params.name, status: 'active', ...params };
          changes.push({
            field: 'domain',
            oldValue: null,
            newValue: params.name,
          });
          break;

        case 'delete-domain':
          before = await this.client.getDomain(params.id || params.name);
          after = null;
          changes.push({
            field: 'domain',
            oldValue: params.name,
            newValue: null,
          });
          break;

        case 'install-ssl':
          before = { ssl: false };
          after = { ssl: true, certificate: params.name };
          changes.push({
            field: 'ssl',
            oldValue: 'disabled',
            newValue: 'enabled',
          });
          break;

        case 'update-php':
          before = await this.client.getPHPSettings(params.domainId);
          after = { ...before, ...params.settings };
          Object.keys(params.settings).forEach(key => {
            changes.push({
              field: `php.${key}`,
              oldValue: before?.[key] || 'not set',
              newValue: params.settings[key],
            });
          });
          break;

        case 'configure-proxy':
          before = await this.client.getReverseProxyConfig(params.domainId);
          after = { ...params.config };
          changes.push({
            field: 'proxy.target',
            oldValue: before?.targetUrl || 'not set',
            newValue: params.config.targetUrl,
          });
          break;
      }
    } catch (error: any) {
      // If we can't get current state, that's okay for some operations
      console.warn(`Could not get current state: ${error.message}`);
    }

    return { before, after, changes };
  }

  /**
   * Apply an operation with validation
   */
  async applyOperation(operation: string, params: any): Promise<OperationResult> {
    try {
      let result: any;
      let rollbackData: any = null;

      switch (operation) {
        case 'create-domain':
          // Backup: none needed for creation
          result = await this.client.createDomain(params);
          rollbackData = { operation: 'delete-domain', domainId: result.id };
          this.rollbackStack.push(rollbackData);
          return {
            success: true,
            message: `Domain ${params.name} created successfully`,
            rollbackData,
          };

        case 'delete-domain':
          // Backup: get domain info first
          const domainInfo = await this.client.getDomain(params.id || params.name);
          rollbackData = { operation: 'create-domain', data: domainInfo };
          
          await this.client.deleteDomain(params.id || params.name);
          this.rollbackStack.push(rollbackData);
          return {
            success: true,
            message: `Domain deleted successfully`,
            rollbackData,
          };

        case 'install-ssl':
          // Backup: current SSL config would be stored here
          result = await this.client.installSSLCertificate(params.domainId, params.certificate);
          rollbackData = { operation: 'restore-ssl', domainId: params.domainId };
          this.rollbackStack.push(rollbackData);
          return {
            success: true,
            message: `SSL certificate installed successfully`,
            rollbackData,
          };

        case 'update-php':
          const currentSettings = await this.client.getPHPSettings(params.domainId);
          rollbackData = { operation: 'update-php', domainId: params.domainId, settings: currentSettings };
          
          result = await this.client.updatePHPSettings(params.domainId, params.settings);
          this.rollbackStack.push(rollbackData);
          return {
            success: true,
            message: `PHP settings updated successfully`,
            rollbackData,
          };

        case 'configure-proxy':
          const currentProxy = await this.client.getReverseProxyConfig(params.domainId);
          rollbackData = { operation: 'configure-proxy', domainId: params.domainId, config: currentProxy };
          
          result = await this.client.configureReverseProxy(params.domainId, params.config);
          this.rollbackStack.push(rollbackData);
          return {
            success: true,
            message: `Reverse proxy configured successfully`,
            rollbackData,
          };

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Operation failed: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Rollback the last operation
   */
  async rollback(): Promise<OperationResult> {
    if (this.rollbackStack.length === 0) {
      return {
        success: false,
        message: 'No operations to rollback',
      };
    }

    const lastOp = this.rollbackStack.pop();
    if (!lastOp) {
      return {
        success: false,
        message: 'Failed to get rollback data',
      };
    }

    try {
      // Apply the rollback operation
      const result = await this.applyOperation(lastOp.operation, lastOp);
      // Remove the rollback entry created by the rollback operation itself
      this.rollbackStack.pop();
      
      return {
        success: true,
        message: `Rolled back operation: ${lastOp.operation}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Rollback failed: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Validate an operation before applying
   */
  async validateOperation(operation: string, params: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    switch (operation) {
      case 'create-domain':
        if (!params.name) {
          errors.push('Domain name is required');
        }
        if (params.name && !/^[a-z0-9][a-z0-9-]*[a-z0-9]\.[a-z]{2,}$/i.test(params.name)) {
          errors.push('Invalid domain name format');
        }
        break;

      case 'install-ssl':
        if (!params.certificate) {
          errors.push('Certificate data is required');
        }
        break;

      case 'update-php':
        if (!params.settings) {
          errors.push('PHP settings are required');
        }
        break;

      case 'configure-proxy':
        if (!params.config?.targetUrl) {
          errors.push('Target URL is required for proxy');
        }
        try {
          new URL(params.config.targetUrl);
        } catch {
          errors.push('Invalid target URL format');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
