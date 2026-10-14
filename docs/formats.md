# Format sources and validation

Official documentation checked on 2026-10-14. This is a private preview, not a
directory submission. Known official documentation/repository URLs below are
references, not invented Dench listing or support URLs.

## Sources

| Format / behavior | Official reference | Decision |
| --- | --- | --- |
| Cursor manifest and discovery | [Plugins reference](https://cursor.com/docs/reference/plugins) | `.cursor-plugin/plugin.json`, shared skills, explicit `mcpServers` file override |
| Cursor installation | [Plugins](https://cursor.com/docs/plugins) | Private local development install; team access remains controlled by an admin |
| Cursor schema | [plugin.schema.json](https://github.com/cursor/plugins/blob/main/schemas/plugin.schema.json), [marketplace.schema.json](https://github.com/cursor/plugins/blob/main/schemas/marketplace.schema.json) | Use the upstream schemas for validation; no fabricated `$schema` identifier |
| Claude Code plugin | [Manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference), [plugins reference](https://code.claude.com/docs/en/plugins-reference) | Standard skills and `.mcp.json` auto-discovery; no duplicate explicit discovery paths |
| Claude Code marketplace | [Marketplace guide](https://code.claude.com/docs/en/plugin-marketplaces) | Relative `./` source is the repository root; local clone works before merge |
| Claude Code MCP | [MCP servers](https://code.claude.com/docs/en/mcp-servers) | `type: http`, browser OAuth |
| Codex plugin and catalog | [Package your plugin](https://developers.openai.com/plugins/build/plugins), [sample spec](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/plugin-creator/references/plugin-json-spec.md) | Supported `.codex-plugin` compatibility layout, `.agents/plugins/marketplace.json`, local root source |
| Codex MCP | [MCP](https://developers.openai.com/codex/mcp), [CLI add example](https://developers.openai.com/learn/docs-mcp) | Manual MCP-only fallback for clients without plugin support |
| Gemini extension / skills | [Extension reference](https://geminicli.com/docs/extensions/reference/) | Root `gemini-extension.json`, `skills/` discovery |
| Gemini MCP / OAuth | [MCP servers](https://geminicli.com/docs/tools/mcp-server/) | `httpUrl` for Streamable HTTP; automatic OAuth discovery; no `trust` bypass |
| ChatGPT connector | [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) | Remote MCP registration in developer mode, not legacy `ai-plugin.json` |
| Grok Build configuration | [Official MCP setup example](https://docs.x.ai/developers/docs-mcp) | Documented `grok mcp add --transport http` command, not a store manifest |
| xAI API remote MCP | [Remote MCP tools](https://docs.x.ai/developers/tools/remote-mcp) | Caller-side API configuration, no credentials shipped in this repository |
| Muse | [Meta connector help](https://www.meta.com/help/artificial-intelligence/1687253048996149/) | Connector UX documented; public package/submission format and Dench compatibility remain unverified |

Cursor and OpenAI also document the newer portable Agent Plugins format. This
repository deliberately uses their documented native/compatibility manifests to
meet the requested client layouts without introducing a second root manifest or
ambiguous format precedence. It can migrate to a single portable package after
client acceptance testing.

## Dench source of truth (read-only)

- CLI: `DenchHQ/dench.com`, `staging` at
  `97cee8b93850129a5863f3416da95bb95fcf79cd`: `cli/package.json`,
  `cli/README.md`, `cli/host.ts`, `cli/session.ts`, and
  `cli/lib/command-registry.ts`. Package `@dench.com/cli` version in that source:
  `3.11.6`; binary `dench`; Node >=20. No package version is silently pinned by
  the plugin: npx resolves the published default unless the user pins a version.
- MCP: [PR 1273](https://github.com/DenchHQ/dench.com/pull/1273),
  `feat/mcp-server` at `5e05fe222c20a20703b59e265ee73447d14bfa96`,
  `src/lib/mcp/README.md`. This is a contract reference, not proof of deployment.
- No root LICENSE/COPYING file or package license field was found in the
  referenced CLI/root package metadata. Per the requested default, newly authored
  plugin contents use MIT. No Dench application source is redistributed here.

## Repeatable checks

Run from the repository root (Node 20+):

```sh
node scripts/validate.mjs
node --check scripts/validate.mjs
git diff --check
```

The local validator checks JSON parsing, synchronized versions/names, declared
component paths, marketplace root sources, skill frontmatter, and the precise
credential-free endpoint/transport shapes. It also rejects unknown manifest
fields for the subset used here. These are repository invariants, not a complete
reimplementation of every upstream schema. There are no runtime dependencies,
TypeScript files, or build step; `node --check` is the script syntax check.

With Claude Code installed, also run:

```sh
claude plugin validate .
claude plugin validate .claude-plugin/plugin.json
```

Validate the Cursor plugin and marketplace against the upstream JSON Schemas
linked above using a Draft 7 JSON Schema validator with format checks. Record
the upstream revision used in the PR; do not describe the local consistency
script as official schema validation. No official standalone cross-client
validator is assumed. When an installed CLI lacks validation support, report
that limit rather than treating `--help` or JSON parsing as runtime acceptance.

## Client acceptance (requires deployed MCP and a human)

For each client: install privately, check both skills where supported, connect
with browser OAuth, inspect workspace context, and verify a read-only grant
exposes 15 tools. In a disposable workspace, explicitly consent to write/actions,
verify the 26-tool inventory, a CRM write/readback, approval-gated action, and
grant revocation. Do not create/delete production data as a packaging test.

Static/schema checks cannot establish account eligibility, directory approval,
OAuth callback compatibility, or production availability. Privacy/support URLs,
branding, reviewer credentials, screenshots, and submission approval remain
release TODOs in the README.
