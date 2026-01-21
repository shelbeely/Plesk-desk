import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { PleskConfig, PleskDomain, PleskSSLCertificate } from '../types';

export class PleskRestClient {
  private client: AxiosInstance;
  private config: PleskConfig;

  constructor(config: PleskConfig) {
    this.config = config;
    const baseURL = `${config.secure !== false ? 'https' : 'http'}://${config.host}:${config.port || 8443}`;

    this.client = axios.create({
      baseURL: `${baseURL}/api/v2`,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
      },
      auth: config.username && config.password ? {
        username: config.username,
        password: config.password,
      } : undefined,
      httpsAgent: new https.Agent({
        rejectUnauthorized: config.rejectUnauthorized !== false,
      }),
    });
  }

  async listDomains(): Promise<PleskDomain[]> {
    try {
      const response = await this.client.get('/domains');
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to list domains: ${error.message}`);
    }
  }

  async getDomain(domainId: number): Promise<PleskDomain> {
    try {
      const response = await this.client.get(`/domains/${domainId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get domain: ${error.message}`);
    }
  }

  async createDomain(data: Partial<PleskDomain>): Promise<PleskDomain> {
    try {
      const response = await this.client.post('/domains', data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create domain: ${error.message}`);
    }
  }

  async updateDomain(domainId: number, data: Partial<PleskDomain>): Promise<PleskDomain> {
    try {
      const response = await this.client.put(`/domains/${domainId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to update domain: ${error.message}`);
    }
  }

  async deleteDomain(domainId: number): Promise<void> {
    try {
      await this.client.delete(`/domains/${domainId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete domain: ${error.message}`);
    }
  }

  async listSSLCertificates(domainId?: number): Promise<PleskSSLCertificate[]> {
    try {
      const url = domainId ? `/domains/${domainId}/ssl-certificates` : '/ssl-certificates';
      const response = await this.client.get(url);
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to list SSL certificates: ${error.message}`);
    }
  }

  async installSSLCertificate(domainId: number, certificate: any): Promise<any> {
    try {
      const response = await this.client.post(`/domains/${domainId}/ssl-certificates`, certificate);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to install SSL certificate: ${error.message}`);
    }
  }

  async updatePHPSettings(domainId: number, settings: any): Promise<any> {
    try {
      const response = await this.client.put(`/domains/${domainId}/hosting/php-settings`, settings);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to update PHP settings: ${error.message}`);
    }
  }

  async getPHPSettings(domainId: number): Promise<any> {
    try {
      const response = await this.client.get(`/domains/${domainId}/hosting/php-settings`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get PHP settings: ${error.message}`);
    }
  }

  async configureReverseProxy(domainId: number, config: any): Promise<any> {
    try {
      const response = await this.client.put(`/domains/${domainId}/hosting/proxy-settings`, config);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to configure reverse proxy: ${error.message}`);
    }
  }

  async getReverseProxyConfig(domainId: number): Promise<any> {
    try {
      const response = await this.client.get(`/domains/${domainId}/hosting/proxy-settings`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get reverse proxy config: ${error.message}`);
    }
  }
}
