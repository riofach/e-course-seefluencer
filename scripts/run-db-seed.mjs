import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";

const projectRoot = process.cwd();
const envPath = resolve(projectRoot, ".env");

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

    process.env[key] = value.replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadEnvFile(envPath);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to .env before running npm run db:seed.");
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  await sql`
    insert into plans (name, price, duration_days)
    select 'Pro Monthly', 99000, 30
    where not exists (
      select 1
      from plans
      where name = 'Pro Monthly'
        and price = 99000
        and duration_days = 30
    )
  `;

  console.log("✅ Pricing plans seeded successfully.");
} finally {
  await sql.end();
}
