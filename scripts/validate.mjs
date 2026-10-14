import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const endpoint = 'https://mcp.dench.com/mcp';
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));

function keys(value, allowed, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), label);
  for (const key of Object.keys(value)) {
    assert(allowed.includes(key), `${label}: unexpected field ${key}`);
  }
}

function component(path) {
  assert.equal(typeof path, 'string');
  assert(path.startsWith('./') && !path.split('/').includes('..'), path);
  const resolved = realpathSync(resolve(root, path));
  const fromRoot = relative(root, resolved);
  assert(!isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith('../'), path);
}

function walk(directory) {
  for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.json')) json(path);
  }
}

walk('.');
const base = json('.claude-plugin/plugin.json');
const metadataKeys = ['name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords'];
assert.equal(base.name, 'dench');
assert.match(base.version, /^\d+\.\d+\.\d+$/);
assert.equal(base.license, 'MIT');
assert.equal(base.homepage, 'https://dench.com');
assert.equal(base.repository, 'https://github.com/DenchHQ/dench-plugins');
assert.deepEqual(base.author, { name: 'DenchHQ' });
assert(base.description.length > 0);
assert(base.keywords.every((keyword) => typeof keyword === 'string'));

for (const client of ['claude', 'cursor', 'codex']) {
  const path = `.${client}-plugin/plugin.json`;
  const manifest = json(path);
  keys(manifest, client === 'claude' ? metadataKeys : [...metadataKeys, 'skills', 'mcpServers'], path);
  for (const key of metadataKeys) assert.deepEqual(manifest[key], base[key], `${path}: ${key}`);
  if (client !== 'claude') {
    assert.equal(manifest.skills, './skills/');
    assert.equal(manifest.mcpServers, './.mcp.json');
    component(manifest.skills);
    component(manifest.mcpServers);
  }
}

assert.deepEqual(json('.mcp.json'), {
  mcpServers: { dench: { type: 'http', url: endpoint } },
});
const gemini = json('gemini-extension.json');
assert.deepEqual(gemini, {
  name: base.name,
  version: base.version,
  description: base.description,
  mcpServers: { dench: { httpUrl: endpoint } },
});

for (const client of ['claude', 'cursor']) {
  const path = `.${client}-plugin/marketplace.json`;
  const marketplace = json(path);
  keys(
    marketplace,
    client === 'claude'
      ? ['name', 'description', 'owner', 'plugins']
      : ['name', 'owner', 'metadata', 'plugins'],
    path,
  );
  assert.equal(marketplace.name, 'dench-plugins');
  assert.deepEqual(marketplace.owner, { name: 'DenchHQ' });
  if (client === 'claude') {
    assert.equal(marketplace.description, 'Official Dench plugins and connectors.');
  } else {
    keys(marketplace.metadata, ['description'], `${path}: metadata`);
    assert.equal(marketplace.metadata.description, 'Official Dench plugins and connectors.');
  }
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  keys(entry, ['name', 'source', 'description'], path);
  assert.equal(entry.name, base.name);
  assert.equal(entry.source, './');
  component(entry.source);
}
assert.deepEqual(json('.agents/plugins/marketplace.json'), {
  name: 'dench-plugins',
  displayName: 'Dench',
  plugins: [{
    name: base.name,
    source: { source: 'local', path: './' },
    policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
    category: 'Productivity',
  }],
});

const skills = readdirSync(resolve(root, 'skills')).sort();
assert.deepEqual(skills, ['dench-cli', 'dench-mcp']);
for (const name of skills) {
  const path = `./skills/${name}/SKILL.md`;
  component(path);
  const content = read(path);
  const frontmatter = content.match(/^---\nname: ([a-z0-9-]+)\ndescription: ([^\n]+)\n---\n/);
  assert(frontmatter, `${path}: expected name and description frontmatter`);
  assert.equal(frontmatter[1], name);
  assert(frontmatter[2].length > 0 && frontmatter[2].length <= 1024, path);
}

assert(read('LICENSE').startsWith('MIT License\n'));
console.log('Validated client manifests, catalogs, shared MCP config, paths, skills, and license.');
