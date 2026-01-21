import { PleskConfig, PleskDomain, PleskSSLCertificate } from '../types';
import { PleskRestClient } from './rest-client';
import { PleskXmlClient } from './xml-client';

export class PleskClient {
  private restClient: PleskRestClient;
  private xmlClient: PleskXmlClient;
  private preferRest: boolean;

  constructor(config: PleskConfig, preferRest: boolean = true) {
    this.restClient = new PleskRestClient(config);
    this.xmlClient = new PleskXmlClient(config);
    this.preferRest = preferRest;
  }

  async listDomains(): Promise<PleskDomain[]> {
    if (this.preferRest) {
      try {
        return await this.restClient.listDomains();
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.listDomains();
      }
    }
    return await this.xmlClient.listDomains();
  }

  async getDomain(idOrName: number | string): Promise<PleskDomain | any> {
    if (this.preferRest && typeof idOrName === 'number') {
      try {
        return await this.restClient.getDomain(idOrName);
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.getDomain(String(idOrName));
      }
    }
    return await this.xmlClient.getDomain(String(idOrName));
  }

  async createDomain(data: any): Promise<PleskDomain | any> {
    if (this.preferRest) {
      try {
        return await this.restClient.createDomain(data);
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.createDomain(data);
      }
    }
    return await this.xmlClient.createDomain(data);
  }

  async updateDomain(idOrName: number | string, data: any): Promise<PleskDomain | any> {
    if (this.preferRest && typeof idOrName === 'number') {
      try {
        return await this.restClient.updateDomain(idOrName, data);
      } catch (error) {
        console.warn('REST API failed, operation may have failed');
        throw error;
      }
    }
    throw new Error('Update via XML API not yet implemented');
  }

  async deleteDomain(idOrName: number | string): Promise<void> {
    if (this.preferRest && typeof idOrName === 'number') {
      try {
        return await this.restClient.deleteDomain(idOrName);
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.deleteDomain(String(idOrName));
      }
    }
    return await this.xmlClient.deleteDomain(String(idOrName));
  }

  async listSSLCertificates(domainId?: number): Promise<PleskSSLCertificate[]> {
    if (this.preferRest) {
      try {
        return await this.restClient.listSSLCertificates(domainId);
      } catch (error) {
        console.warn('REST API failed for SSL certificates');
        return [];
      }
    }
    return [];
  }

  async installSSLCertificate(domainIdOrName: number | string, certificate: any): Promise<any> {
    if (this.preferRest && typeof domainIdOrName === 'number') {
      try {
        return await this.restClient.installSSLCertificate(domainIdOrName, certificate);
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.installSSLCertificate(String(domainIdOrName), certificate);
      }
    }
    return await this.xmlClient.installSSLCertificate(String(domainIdOrName), certificate);
  }

  async getPHPSettings(domainId: number): Promise<any> {
    if (this.preferRest) {
      try {
        return await this.restClient.getPHPSettings(domainId);
      } catch (error) {
        console.warn('REST API failed for PHP settings');
        return null;
      }
    }
    return null;
  }

  async updatePHPSettings(domainIdOrName: number | string, settings: any): Promise<any> {
    if (this.preferRest && typeof domainIdOrName === 'number') {
      try {
        return await this.restClient.updatePHPSettings(domainIdOrName, settings);
      } catch (error) {
        console.warn('REST API failed, falling back to XML API');
        return await this.xmlClient.updatePHPSettings(String(domainIdOrName), settings);
      }
    }
    return await this.xmlClient.updatePHPSettings(String(domainIdOrName), settings);
  }

  async getReverseProxyConfig(domainId: number): Promise<any> {
    if (this.preferRest) {
      try {
        return await this.restClient.getReverseProxyConfig(domainId);
      } catch (error) {
        console.warn('REST API failed for reverse proxy config');
        return null;
      }
    }
    return null;
  }

  async configureReverseProxy(domainId: number, config: any): Promise<any> {
    if (this.preferRest) {
      try {
        return await this.restClient.configureReverseProxy(domainId, config);
      } catch (error) {
        throw error;
      }
    }
    throw new Error('Reverse proxy configuration via XML API not yet implemented');
  }
}
