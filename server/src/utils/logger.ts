export const logger = {
  info: (message: string, data?: unknown) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, data ?? "");
  },

  warn: (message: string, data?: unknown) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, data ?? "");
  },

  error: (message: string, error?: unknown) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error ?? "");
  },

  request: (method: string, path: string, status: number, durationMs: number) => {
    console.log(`[${new Date().toISOString()}] ${method} ${path} -> ${status} (${durationMs}ms)`);
  },
};
