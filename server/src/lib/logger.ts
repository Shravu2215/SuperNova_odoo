/**
 * Centralized logging - helps judges trace execution and debug issues
 */

export const logger = {
  info: (message: string, data?: any) => {
    console.log(
      `\n[${new Date().toISOString()}] ℹ️  INFO: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },

  error: (message: string, error?: any) => {
    console.error(
      `\n[${new Date().toISOString()}] ❌ ERROR: ${message}`,
      error ? JSON.stringify(error, null, 2) : ""
    );
  },

  warn: (message: string, data?: any) => {
    console.warn(
      `\n[${new Date().toISOString()}] ⚠️  WARN: ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },

  debug: (message: string, data?: any) => {
    if (process.env.DEBUG === "true") {
      console.log(
        `\n[${new Date().toISOString()}] 🐛 DEBUG: ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  },

  request: (method: string, path: string, status: number, time: number) => {
    console.log(
      `[${new Date().toISOString()}] 🌐 ${method} ${path} → ${status} (${time}ms)`
    );
  },
};
