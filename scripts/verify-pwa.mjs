import { access } from 'node:fs/promises';

const requiredFiles = [
  'dist/tecnihub-frontend/browser/ngsw.json',
  'dist/tecnihub-frontend/browser/manifest.webmanifest',
];

for (const file of requiredFiles) {
  await access(file);
  console.log(`Verified PWA build file: ${file}`);
}
