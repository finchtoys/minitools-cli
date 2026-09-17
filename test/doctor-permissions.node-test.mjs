import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = resolve(dirname(fileURLToPath(import.meta.url)), '../bin/minitools.mjs');

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf-8' });
}

/** Every permission bit the Finch runtime understands, in its strongest form. */
const FULL_PERMISSION_SURFACE = {
  filesystem: 'readwrite',
  network: true,
  shell: true,
  agentEvents: 'full',
  secrets: ['API_KEY', 'SERVICE_TOKEN.*'],
  oauth: ['github'],
  artifacts: true,
  collaboration: true,
  sessions: true,
  sessionInteractions: 'all',
  destructiveInteractions: true,
  sessionWaits: 'all',
  appearance: true,
};

async function fixture(finch) {
  const root = await mkdtemp(join(tmpdir(), 'finch-minitools-doctor-'));
  mkdirSync(join(root, 'dist'), { recursive: true });
  writeFileSync(join(root, 'dist/index.js'), 'export function activate() {}\n');
  writeFileSync(join(root, 'package.json'), `${JSON.stringify({
    name: 'doctor-fixture',
    version: '1.0.0',
    main: 'dist/index.js',
    finch: {
      id: 'doctor-fixture',
      name: 'Doctor Fixture',
      description: 'fixture for doctor permission schema',
      miniToolType: 'community',
      ...finch,
    },
  }, null, 2)}\n`);
  return root;
}

test('doctor accepts the full runtime permission surface', async (t) => {
  const root = await fixture({ permissions: FULL_PERMISSION_SURFACE });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = run(['doctor', root]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /✓ No issues found\./);
});

test("doctor accepts the owned tier spelled as true (1.6.1 semantics)", async (t) => {
  const root = await fixture({
    permissions: { sessions: true, sessionInteractions: true, sessionWaits: true },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = run(['doctor', root]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /✓ No issues found\./);
});

test('doctor flags a misspelled permission bit and a bad scope value', async (t) => {
  const root = await fixture({
    permissions: { sessionInteraction: 'all', sessionWaits: 'every' },
  });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = run(['doctor', root]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /finch\.permissions\.sessionInteraction 不是已知权限位/);
  assert.match(result.stdout, /finch\.permissions\.sessionWaits 应为 boolean 或 'all'/);
});

test('doctor still rejects unsupported secret patterns', async (t) => {
  const root = await fixture({ permissions: { secrets: ['*'] } });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = run(['doctor', root]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /仅允许精确 key 或末尾 \.\* 前缀/);
});
