#!/usr/bin/env node
/**
 * Pack this backend project into deploy/artifacts/sgn-website-backend.tar.gz
 * (or ./sgn-website-backend.tar.gz) for scp to Ubuntu.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'deploy');
fs.mkdirSync(outDir, { recursive: true });

const staging = path.join(outDir, 'sgn-website-backend');
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

const copyList = [
  'package.json',
  'package-lock.json',
  'start-api.sh',
  'start-api.cmd',
  '.env.example',
  'README.md',
  'tsconfig.json',
  'server',
  'scripts',
];

for (const name of copyList) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) continue;
  execSync(`cp -R "${src}" "${path.join(staging, name)}"`, { stdio: 'inherit' });
}

// Never ship secrets or bulky dirs
for (const drop of ['.env', 'node_modules', 'uploads', 'dist', '_legacy_src']) {
  fs.rmSync(path.join(staging, drop), { recursive: true, force: true });
}

const tarball = path.join(outDir, 'sgn-website-backend.tar.gz');
fs.rmSync(tarball, { force: true });
execSync(`tar -czf "${tarball}" -C "${outDir}" sgn-website-backend`, { stdio: 'inherit' });

console.log(`\nPacked: ${tarball}`);
console.log('Upload: scp deploy/sgn-website-backend.tar.gz ubuntu@SERVER:/home/ubuntu/');
console.log('On Ubuntu: tar -xzf sgn-website-backend.tar.gz && cd sgn-website-backend && cp .env.example .env && npm install && ./start-api.sh');
