export interface PleskConfig {
  host: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  secure?: boolean;
}

export interface PleskDomain {
  id: number;
  name: string;
  status: string;
  ipAddress?: string;
  hosting?: {
    phpVersion?: string;
    ssl?: boolean;
  };
}

export interface PleskSSLCertificate {
  id: number;
  name: string;
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
}

export interface PleskPHPSettings {
  version: string;
  extensions?: string[];
  settings?: Record<string, string>;
}

export interface PleskReverseProxy {
  id: number;
  domain: string;
  targetUrl: string;
  enabled: boolean;
}

export interface OperationPlan {
  operation: string;
  description: string;
  steps: PlanStep[];
  risks: string[];
}

export interface PlanStep {
  action: string;
  description: string;
  reversible: boolean;
}

export interface OperationDiff {
  before: any;
  after: any;
  changes: Change[];
}

export interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface OperationResult {
  success: boolean;
  message: string;
  rollbackData?: any;
  errors?: string[];
}
