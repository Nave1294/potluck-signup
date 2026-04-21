import fs from "fs";
import path from "path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const entriesFile = path.join(dataDir, "entries.json");
const configFile = path.join(dataDir, "config.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export type Entry = {
  id: string;
  name: string;
  dish: string;
  category: string;
  notes: string;
  createdAt: number;
};

export function readEntries(): Entry[] {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(entriesFile, "utf-8"));
  } catch {
    return [];
  }
}

export function writeEntries(entries: Entry[]) {
  ensureDir();
  fs.writeFileSync(entriesFile, JSON.stringify(entries, null, 2));
}

export function readConfig(): Record<string, string> {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(configFile, "utf-8"));
  } catch {
    return {};
  }
}

export function writeConfig(updates: Record<string, string>) {
  ensureDir();
  const current = readConfig();
  fs.writeFileSync(configFile, JSON.stringify({ ...current, ...updates }, null, 2));
}
