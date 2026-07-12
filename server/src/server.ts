import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { logger } from "./utils/logger";

const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Server running on http://0.0.0.0:${env.PORT}`);
  logger.info(`Allowing frontend from ${env.CLIENT_URL}`);
});

process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});
