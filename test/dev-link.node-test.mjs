import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
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
  const root = await mkdtemp(join(tmpdir(), 'finch-minitools-dev-'));
  const source = join(root, 'source');
  const agentHome = join(root, 'agent-home');
  const runtimeHome = join(root, 'runtime-home');
  mkdirSync(join(source, 'dist'), { recursive: true });
  writeFileSync(join(source, 'dist', 'index.js'), 'export function activate() {}\n');
  writeFileSync(join(source, 'package.json'), JSON.stringify({
    name: '@scope/dev-tool',
    version: '1.0.0',
    main: 'dist/index.js',
    finch: {
      id: 'author-short-id',
      name: 'Dev Tool',
      description: 'Development link fixture',
      miniToolType: 'local',
    },
  }, null, 2));
  return {
    root,
    source,
    env: {
      FINCH_AGENT_HOME: agentHome,
      FINCH_RUNTIME_HOME: runtimeHome,
    },
    link: join(agentHome, '.finch', 'extensions', 'scope@dev-tool'),
    lock: join(agentHome, '.finch', 'extensions', '.plugins-lock.json'),
  };
}

test('add -d links a local mini tool without modifying its source', async (t) => {
  const f = await fixture();
  t.after(() => rmSync(f.root, { recursive: true, force: true }));

  const added = run(['add', f.source, '-d'], f.env);
  assert.equal(added.status, 0, added.stderr);
  assert.match(added.stdout, /Linked "Dev Tool" \(scope@dev-tool\)/);
  assert.equal(lstatSync(f.link).isSymbolicLink(), true);
  assert.equal(resolve(dirname(f.link), readlinkSync(f.link)), f.source);
  assert.equal(existsSync(join(f.source, '.finch-id')), false);

  const lock = JSON.parse(readFileSync(f.lock, 'utf-8'));
  assert.equal(lock['scope@dev-tool'].type, 'dev');
  assert.equal(lock['scope@dev-tool'].mode, 'development');
  assert.equal(lock['scope@dev-tool'].linked, true);
  assert.equal(lock['scope@dev-tool'].localPath, f.source);

  const listed = run(['list'], f.env);
  assert.equal(listed.status, 0, listed.stderr);
  assert.match(listed.stdout, /^scope@dev-tool\t1\.0\.0\tdisabled,linked\tDev Tool\t/m);

  const updated = run(['update', 'scope@dev-tool'], f.env);
  assert.equal(updated.status, 1);
  assert.match(updated.stderr, /development link and cannot be updated/);
  assert.equal(lstatSync(f.link).isSymbolicLink(), true);

  const removed = run(['remove', 'scope@dev-tool'], f.env);
  assert.equal(removed.status, 0, removed.stderr);
  assert.equal(existsSync(f.link), false);
  assert.equal(existsSync(f.source), true);
});

test('--dev rejects non-directory sources', async (t) => {
  const f = await fixture();
  t.after(() => rmSync(f.root, { recursive: true, force: true }));

  const npmResult = run(['add', '@scope/dev-tool', '--dev'], f.env);
  assert.equal(npmResult.status, 1);
  assert.match(npmResult.stderr, /only supports a local extension directory/);

  const file = join(f.root, 'plugin.zip');
  writeFileSync(file, 'not-an-archive');
  const archiveResult = run(['add', file, '--dev'], f.env);
  assert.equal(archiveResult.status, 1);
  assert.match(archiveResult.stderr, /requires a directory, not an archive/);
});
