import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = resolve(dirname(fileURLToPath(import.meta.url)), '../bin/minitools.mjs');

function run(args, env) {
  return spawnSync(process.execPath, [cli, ...args], {
    env: { ...process.env, ...env },
    encoding: 'utf-8',
  });
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'finch-minitools-state-'));
  const runtimeHome = join(root, 'runtime-home');
  mkdirSync(runtimeHome, { recursive: true });
  return {
    root,
    statePath: join(runtimeHome, 'extensions.json'),
    env: {
      FINCH_AGENT_HOME: join(root, 'agent-home'),
      FINCH_RUNTIME_HOME: runtimeHome,
    },
  };
}

test('enable writes the current extension state schema', async (t) => {
  const f = await fixture();
  t.after(() => rmSync(f.root, { recursive: true, force: true }));

  const enabled = run(['enable', 'current'], f.env);
  assert.equal(enabled.status, 0, enabled.stderr);
  assert.deepEqual(JSON.parse(readFileSync(f.statePath, 'utf-8')), {
    enabled: ['current'],
    extensions: { current: { enabled: true } },
    autoUpdate: false,
  });
});

test('a CLI write converts published plugin state without dropping permissions', async (t) => {
  const f = await fixture();
  t.after(() => rmSync(f.root, { recursive: true, force: true }));
  writeFileSync(f.statePath, JSON.stringify({
    plugins: {
      legacy: { enabled: true, grantedPermissions: { tools: ['read'] } },
    },
  }));

  const enabled = run(['enable', 'current'], f.env);
  assert.equal(enabled.status, 0, enabled.stderr);
  assert.deepEqual(JSON.parse(readFileSync(f.statePath, 'utf-8')), {
    enabled: ['current', 'legacy'],
    extensions: {
      legacy: { enabled: true, grantedPermissions: { tools: ['read'] } },
      current: { enabled: true },
    },
    autoUpdate: false,
  });
});
