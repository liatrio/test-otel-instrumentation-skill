#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'otel-instrumentation';
const SOURCE_DIR = path.join(__dirname, '..');
const TARGET_DIR = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.gitkeep') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  fs.copyFileSync(
    path.join(SOURCE_DIR, 'SKILL.md'),
    path.join(TARGET_DIR, 'SKILL.md')
  );

  copyDir(
    path.join(SOURCE_DIR, 'references'),
    path.join(TARGET_DIR, 'references')
  );

  console.log(`\notel-instrumentation skill installed to ${TARGET_DIR}`);
  console.log('Restart Claude Code and use /otel-instrumentation to get started.\n');
} catch (err) {
  console.error(`\nFailed to install otel-instrumentation skill: ${err.message}`);
  console.error(`Manually copy SKILL.md and references/ to ${TARGET_DIR}\n`);
  process.exit(1);
}
