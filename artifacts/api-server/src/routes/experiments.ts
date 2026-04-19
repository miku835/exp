import { Router, type Request, type Response } from "express";
import { promises as fs } from "fs";
import path from "path";

const router = Router();

const EXPERIMENTS_DIR = process.env.EXPERIMENTS_DIR || path.resolve(process.cwd(), "experiments");
const OUTPUTS_DIR = process.env.OUTPUTS_DIR || path.resolve(process.cwd(), "outputs");

interface Experiment {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  output: string | null;
  subject: string;
}

async function getSubjects(): Promise<string[]> {
  try {
    const entries = await fs.readdir(EXPERIMENTS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function loadExperimentsForSubject(subject: string): Promise<Experiment[]> {
  const subjectDir = path.join(EXPERIMENTS_DIR, subject);
  let files: string[];
  try {
    files = await fs.readdir(subjectDir);
  } catch {
    return [];
  }

  const experiments: Experiment[] = [];
  const sortedFiles = files
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const file of sortedFiles) {
    try {
      const filePath = path.join(subjectDir, file);
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      const fileId = file.replace(/\.json$/, "");
      experiments.push({
        id: `${subject}-${fileId}`,
        title: data.title ?? "Untitled",
        description: data.description ?? "",
        language: data.language ?? "text",
        code: data.code ?? "",
        output: data.output ?? null,
        subject,
      });
    } catch {
      // Skip malformed JSON files
    }
  }
  return experiments;
}

// GET /api/experiments
router.get("/experiments", async (req: Request, res: Response) => {
  const subjects = await getSubjects();
  const allExperiments: Experiment[] = [];
  for (const subject of subjects) {
    const exps = await loadExperimentsForSubject(subject);
    allExperiments.push(...exps);
  }
  res.json({ subjects, experiments: allExperiments });
});

// GET /api/experiments/:subject
router.get("/experiments/:subject", async (req: Request, res: Response) => {
  const subject = req.params.subject as string;
  const subjects = await getSubjects();

  if (!subjects.includes(subject)) {
    res.status(404).json({ error: `Subject '${subject}' not found` });
    return;
  }

  const experiments = await loadExperimentsForSubject(subject);
  res.json(experiments);
});

// GET /api/outputs/:filename — serve output images
router.get("/outputs/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filePath = path.join(OUTPUTS_DIR, filename);
  try {
    await fs.access(filePath);
    res.sendFile(filePath);
  } catch {
    res.status(404).json({ error: "Output file not found" });
  }
});

export default router;
