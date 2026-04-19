import app from "./artifacts/api-server/src/app";

// For Vercel, we need to export the app as the default export.
// We also set the environment variables for file paths since the cwd might change.
import path from "path";

// Correcting the path to target the experiments and outputs folders within the monorepo
process.env.EXPERIMENTS_DIR = path.resolve(__dirname, "..", "artifacts", "api-server", "experiments");
process.env.OUTPUTS_DIR = path.resolve(__dirname, "..", "artifacts", "api-server", "outputs");

export default app;
