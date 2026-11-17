import { loadEnvConfig } from '@next/env';
import fs from 'fs';
import path from 'path';

// 1. Next.js standard env loader
loadEnvConfig(process.cwd());

// 2. Explicitly load .env.local for live integration testing (Vitest sets NODE_ENV='test' which Next.js skips by default)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}
