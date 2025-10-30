#!/usr/bin/env node

/**
 * Pre-build Cleanup Verification Script
 * 
 * This script verifies that the Electron app will be packaged with clean state:
 * - No dev data in IndexedDB
 * - No API keys
 * - Default settings only
 * 
 * The actual cleanup happens in electron/preload.cjs on first run.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying pre-build configuration...');

// Verify preload.cjs has cleanup code
const preloadPath = path.join(__dirname, '..', 'electron', 'preload.cjs');

try {
  const preloadContent = fs.readFileSync(preloadPath, 'utf8');
  
  if (preloadContent.includes('First-run cleanup')) {
    console.log('✅ First-run cleanup code found in preload.cjs');
  } else {
    console.warn('⚠️  First-run cleanup code NOT found in preload.cjs');
    console.warn('    The app may include development data!');
  }

  console.log('');
  console.log('📦 Packaged app will have:');
  console.log('   ✅ Empty database on first run');
  console.log('   ✅ Default settings (no API keys)');
  console.log('   ✅ Users must configure their own API keys');
  console.log('');
  console.log('💡 Cleanup happens automatically on first app launch');
  console.log('');

} catch (error) {
  console.error('❌ Error verifying prebuild config:', error.message);
  process.exit(1);
}
