#!/usr/bin/env tsx

/**
 * Scaffold new domain module
 * Usage: npm run generate:domain <domain-name>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAINS_DIR = path.join(__dirname, '..', 'src', 'domains');

const SERVICE_TEMPLATE = (domainName: string, capitalizedName: string) => `/**
 * ${capitalizedName} Service
 * [Add description]
 */

import type { VeteranProfile } from '../../data/models/index.js';

export interface ${capitalizedName}Result {
  // Add your interface here
}

/**
 * Main service function
 */
export async function ${domainName}Service(
  veteran: VeteranProfile
): Promise<${capitalizedName}Result> {
  // Implement your service logic
  throw new Error('Not implemented');
}
`;

const TEST_TEMPLATE = (domainName: string, capitalizedName: string) => `import { describe, it, expect } from '@jest/globals';
import { ${domainName}Service } from '../src/domains/${domainName}/service.js';
import type { VeteranProfile } from '../data/models/index.js';

describe('${capitalizedName} Service', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'Test Veteran',
    email: 'test@example.com',
    branchHistory: [],
    skills: [],
    credentials: [],
    interests: [],
    targetIndustries: [],
    targetRoles: [],
    locationPreferences: [],
    desiredSalaryRange: { min: 50000, max: 100000, currency: 'USD', period: 'yearly' }
  };

  it('should process veteran profile', async () => {
    const result = await ${domainName}Service(mockVeteran);
    expect(result).toBeDefined();
  });
});
`;

async function generateDomain() {
  const domainName = process.argv[2];

  if (!domainName) {
    console.error('❌ Error: Domain name required');
    console.log('Usage: npm run generate:domain <domain-name>');
    console.log('Example: npm run generate:domain career_coaching');
    process.exit(1);
  }

  console.log(`🔧 Generating domain module: ${domainName}\n`);

  // Create domain directory
  const domainDir = path.join(DOMAINS_DIR, domainName);
  await fs.mkdir(domainDir, { recursive: true });

  // Generate capitalized name
  const capitalizedName = domainName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Create service file
  const servicePath = path.join(domainDir, 'service.ts');
  await fs.writeFile(servicePath, SERVICE_TEMPLATE(domainName, capitalizedName), 'utf-8');
  console.log(`✅ Created service: ${servicePath}`);

  // Create test file
  const testPath = path.join(__dirname, '..', 'tests', `${domainName}.test.ts`);
  await fs.writeFile(testPath, TEST_TEMPLATE(domainName, capitalizedName), 'utf-8');
  console.log(`✅ Created test: ${testPath}`);

  console.log(`\n🎉 Domain module '${domainName}' created successfully!`);
  console.log('\nNext steps:');
  console.log(`1. Implement service logic in src/domains/${domainName}/service.ts`);
  console.log(`2. Add tests in tests/${domainName}.test.ts`);
  console.log(`3. Export from index.ts`);
}

generateDomain().catch(console.error);
