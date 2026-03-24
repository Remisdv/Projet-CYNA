export interface ProxyRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface IProxyService {
  proxy(request: ProxyRequest): Promise<any>;
}
