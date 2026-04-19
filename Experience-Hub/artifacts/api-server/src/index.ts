import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];
const port = rawPort && !Number.isNaN(Number(rawPort)) ? Number(rawPort) : 5000;

if (port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort || 'undefined'}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
