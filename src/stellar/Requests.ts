import { fetch } from "@tauri-apps/plugin-http";

export namespace Stellar {
    export class Requests {
        private static async request<T>(
            method: string,
            url: string,
            body?: any,
            headers: Record<string, string> = {}
        ): Promise<{ status: number; ok: boolean; data: T }> {
            let Headers: Record<string, string> = { ...headers };
            if (body !== undefined) {
                Headers["Content-Type"] = "application/json";
            }

            const response = await fetch(url, {
                method,
                headers: Headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = (await response.json()) as T;

            return {
                status: response.status,
                ok: response.ok,
                data,
            };
        }

        static get<T = any>(url: string, headers: Record<string, string> = {}) {
            return this.request<T>("GET", url, undefined, headers);
        }

        static post<T = any>(
            url: string,
            body: any = {},
            headers: Record<string, string> = {}
        ) {
            return this.request<T>("POST", url, body, headers);
        }

        static put<T = any>(
            url: string,
            body: any = {},
            headers: Record<string, string> = {}
        ) {
            return this.request<T>("PUT", url, body, headers);
        }

        static delete<T = any>(url: string, headers: Record<string, string> = {}) {
            return this.request<T>("DELETE", url, undefined, headers);
        }
    }
}
