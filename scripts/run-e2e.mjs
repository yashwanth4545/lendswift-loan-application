import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import { homedir } from 'node:os';
import { join } from 'node:path';
import waitOn from 'wait-on';

const npmBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function getFreePort(preferred = 4180) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      const server = net.createServer();
      server.unref();
      server.once('error', () => tryPort(port + 1));
      server.listen(port, '127.0.0.1', () => {
        const address = server.address();
        const freePort = typeof address === 'object' && address ? address.port : port;
        server.close(() => resolve(freePort));
      });
    };
    tryPort(Number(process.env.E2E_PORT) || preferred);
  });
}

function run(command, args) {
  return spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
}

function runAndWait(command, args) {
  return new Promise((resolve) => {
    const child = run(command, args);
    child.on('close', (code) => resolve(code ?? 1));
  });
}

function cypressExeMissing() {
  const cacheRoot =
    process.env.CYPRESS_CACHE_FOLDER ?? join(homedir(), 'AppData', 'Local', 'Cypress', 'Cache');
  const base = join(cacheRoot, '13.17.0', 'Cypress');
  const exe = process.platform === 'win32' ? join(base, 'Cypress.exe') : join(base, 'Cypress');
  return !existsSync(exe);
}

async function ensureCypress() {
  if (!cypressExeMissing()) return;
  console.log('Cypress binary not found - downloading (first run only, ~200MB)...');
  const code = await runAndWait(npmBin, ['cypress', 'install']);
  if (code !== 0) {
    console.error('Cypress install failed. Run: npx cypress install');
    process.exit(code);
  }
}

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;

await ensureCypress();

console.log(`E2E preview server -> ${baseUrl}`);

const preview = run(npmBin, ['vite', 'preview', '--port', String(port), '--host', '127.0.0.1']);

try {
  await waitOn({
    resources: [`http-get://127.0.0.1:${port}`],
    timeout: 45000,
    interval: 500,
  });
} catch (error) {
  preview.kill();
  console.error('Preview server did not start:', error);
  process.exit(1);
}

const cypress = run(npmBin, ['cypress', 'run', '--config', `baseUrl=${baseUrl}`]);

cypress.on('close', (code) => {
  preview.kill('SIGTERM');
  process.exit(code ?? 1);
});

preview.on('close', (code) => {
  if (code && code !== 0 && code !== null) {
    console.error('Preview server exited with code', code);
  }
});

process.on('SIGINT', () => {
  preview.kill('SIGTERM');
  cypress.kill('SIGTERM');
  process.exit(130);
});
