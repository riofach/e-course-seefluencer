import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";

const projectRoot = process.cwd();
const envPath = resolve(projectRoot, ".env");
const seedPath = resolve(projectRoot, "scripts", "seed-story-2-3.sql");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (process.env[key] !== undefined) {
      continue;
    }

    const normalizedValue = value.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = normalizedValue;
  }
}

loadEnvFile(envPath);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Add it to .env or your shell before running db:seed:story-2-3.",
  );
}

if (!existsSync(seedPath)) {
  throw new Error(`Seed SQL file not found: ${seedPath}`);
}

const seedSql = readFileSync(seedPath, "utf8");
const sql = postgres(databaseUrl, { max: 1 });

try {
  await sql.unsafe(seedSql);
  console.log("✅ Story 2.3 seed completed successfully.");
  console.log("Seeded slugs: react-dasar, nextjs-lanjut, draft-course-hidden");
} finally {
  await sql.end();
}
