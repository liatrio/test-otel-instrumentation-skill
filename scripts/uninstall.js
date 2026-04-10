#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'otel-instrumentation';
const TARGET_DIR = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);

try {
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    console.log(`\notel-instrumentation skill removed from ${TARGET_DIR}\n`);
  } else {
    console.log(`\notel-instrumentation skill not found at ${TARGET_DIR} — nothing to remove.\n`);
  }
} catch (err) {
  console.error(`\nFailed to remove otel-instrumentation skill: ${err.message}`);
  console.error(`Manually delete ${TARGET_DIR}\n`);
  process.exit(1);
}
