#!/usr/bin/env tsx

/**
 * Generate TypeScript types from Zod schemas
 * Usage: npm run generate:models
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, '..', 'data', 'models');
const OUTPUT_FILE = path.join(MODELS_DIR, 'index.ts');

async function generateModels() {
  console.log('🔧 Generating TypeScript models from Zod schemas...\n');

  // Read all schema files
  const files = await fs.readdir(MODELS_DIR);
  const schemaFiles = files.filter(f => f.endsWith('.schema.ts'));

  let exports = '/**\n * Auto-generated model exports\n * DO NOT EDIT MANUALLY\n */\n\n';

  for (const file of schemaFiles) {
    const moduleName = file.replace('.schema.ts', '');
    exports += `export * from './${moduleName}.schema.js';\n`;
  }

  await fs.writeFile(OUTPUT_FILE, exports, 'utf-8');

  console.log(`✅ Generated index.ts with ${schemaFiles.length} schema exports`);
  console.log(`📁 Output: ${OUTPUT_FILE}\n`);
}

generateModels().catch(console.error);
