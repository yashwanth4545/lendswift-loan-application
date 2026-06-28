import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import net from 'node:net';
import waitOn from 'wait-on';

const npmBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const root = process.cwd();

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
    cwd: root,
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
  console.log('Cypress binary not found - downloading (first run only)...');
  const code = await runAndWait(npmBin, ['cypress', 'install']);
  if (code !== 0) process.exit(code);
}

console.log('Building production bundle for demo...');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const buildCode = await runAndWait(npmCmd, ['run', 'build']);
if (buildCode !== 0) process.exit(buildCode);

const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;

await ensureCypress();

console.log(`Demo preview server -> ${baseUrl}`);

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

const cypress = run(npmBin, [
  'cypress',
  'run',
  '--config-file',
  'cypress.demo.config.ts',
  '--config',
  `baseUrl=${baseUrl}`,
]);

cypress.on('close', (code) => {
  preview.kill('SIGTERM');

  const videoSrc = join(root, 'cypress', 'videos', 'demo-recording.cy.ts.mp4');
  const demoDir = join(root, 'demo');
  const videoDest = join(demoDir, 'lendswift-demo.mp4');

  if (existsSync(videoSrc)) {
    mkdirSync(demoDir, { recursive: true });
    copyFileSync(videoSrc, videoDest);
    console.log('');
    console.log('Demo video saved:');
    console.log(`  ${videoDest}`);
    console.log('');
  } else if (code === 0) {
    console.warn('Cypress passed but video file not found at:', videoSrc);
  }

  process.exit(code ?? 1);
});

process.on('SIGINT', () => {
  preview.kill('SIGTERM');
  cypress.kill('SIGTERM');
  process.exit(130);
});
