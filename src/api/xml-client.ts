import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { parseStringPromise, Builder } from 'xml2js';
import { PleskConfig } from '../types';

export class PleskXmlClient {
  private client: AxiosInstance;
  private config: PleskConfig;
  private xmlBuilder: Builder;

  constructor(config: PleskConfig) {
    this.config = config;
    const baseURL = `${config.secure !== false ? 'https' : 'http'}://${config.host}:${config.port || 8443}`;

    this.client = axios.create({
      baseURL: `${baseURL}/enterprise/control/agent.php`,
      headers: {
        'Content-Type': 'text/xml',
        'HTTP_AUTH_LOGIN': config.username || '',
        'HTTP_AUTH_PASSWD': config.password || '',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: config.rejectUnauthorized !== false,
      }),
    });

    this.xmlBuilder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });
  }

  private async sendRequest(packet: any): Promise<any> {
    const xml = this.xmlBuilder.buildObject({ packet });
    try {
      const response = await this.client.post('', xml);
      const result = await parseStringPromise(response.data);
      return result;
    } catch (error: any) {
      throw new Error(`XML API request failed: ${error.message}`);
    }
  }

  async listDomains(): Promise<any[]> {
    const packet = {
      domain: {
        get: {
          filter: {},
          dataset: {
            gen_info: {},
            hosting: {},
          },
        },
      },
    };

    const result = await this.sendRequest(packet);
    return this.parseDomainsResponse(result);
  }

  async getDomain(domainName: string): Promise<any> {
    const packet = {
      domain: {
        get: {
          filter: { name: domainName },
          dataset: {
            gen_info: {},
            hosting: {},
          },
        },
      },
    };

    const result = await this.sendRequest(packet);
    const domains = this.parseDomainsResponse(result);
    return domains[0] || null;
  }

  async createDomain(domainData: any): Promise<any> {
    const packet = {
      domain: {
        add: {
          'gen_setup': domainData,
        },
      },
    };

    return await this.sendRequest(packet);
  }

  async deleteDomain(domainName: string): Promise<any> {
    const packet = {
      domain: {
        del: {
          filter: { name: domainName },
        },
      },
    };

    return await this.sendRequest(packet);
  }

  async installSSLCertificate(domainName: string, certificate: any): Promise<any> {
    const packet = {
      certificate: {
        install: {
          name: certificate.name,
          site: domainName,
          content: {
            'csr': certificate.csr,
            'cert': certificate.cert,
            'ca-cert': certificate.ca,
          },
        },
      },
    };

    return await this.sendRequest(packet);
  }

  async updatePHPSettings(domainName: string, settings: any): Promise<any> {
    const packet = {
      domain: {
        set: {
          filter: { name: domainName },
          values: {
            hosting: {
              vrt_hst: {
                property: Object.entries(settings).map(([name, value]) => ({
                  name,
                  value,
                })),
              },
            },
          },
        },
      },
    };

    return await this.sendRequest(packet);
  }

  private parseDomainsResponse(result: any): any[] {
    try {
      const domains = result?.packet?.domain?.get?.result || [];
      return Array.isArray(domains) ? domains : [domains];
    } catch {
      return [];
    }
  }
}
