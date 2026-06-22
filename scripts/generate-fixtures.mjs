import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../cypress/fixtures');
mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'sample.png'),
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
);
writeFileSync(join(dir, 'sample.pdf'), '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
writeFileSync(join(dir, 'invalid.txt'), 'not-an-image');
writeFileSync(join(dir, 'oversized.png'), Buffer.alloc(6 * 1024 * 1024, 1));

console.log('Cypress fixtures generated in', dir);
