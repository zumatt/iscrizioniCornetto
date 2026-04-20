import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'env.js');

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    let [, key, value] = match;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const fileEnv = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
const supabaseUrl = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || fileEnv.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env or process.env');
}

const output = `window.APP_CONFIG = {
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_KEY: ${JSON.stringify(supabaseKey)}
};
`;

writeFileSync(outputPath, output);
