import axios, { AxiosRequestConfig } from "axios";

export class Requests {
  private static async request<T>(
    method: string,
    url: string,
    body?: any,
    headers: Record<string, string> = {},
  ): Promise<{ status: number; ok: boolean; data: T }> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      data: body,
    };

    console.log(`req: ${method} ${url}`, body ? body : "");

    try {
      const response = await axios(config);
      return {
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        data: response.data as T,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          ok: false,
          data: error.response.data as T,
        };
      }
      throw error;
    }
  }

  static get<T = any>(url: string, headers: Record<string, string> = {}) {
    return this.request<T>("GET", url, undefined, headers);
  }

  static post<T = any>(
    url: string,
    body: any = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>("POST", url, body, headers);
  }

  static put<T = any>(
    url: string,
    body: any = {},
    headers: Record<string, string> = {},
  ) {
    return this.request<T>("PUT", url, body, headers);
  }

  static delete<T = any>(url: string, headers: Record<string, string> = {}) {
    return this.request<T>("DELETE", url, undefined, headers);
  }

  static changeUsername<T = any>(
    url: string,
    newUsername: string,
    token: string,
  ) {
    return this.post<T>(
      `${url}/change-username`,
      { newUsername },
      { Authorization: `Bearer ${token}` },
    );
  }
}
