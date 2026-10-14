# Format sources and validation

## Sources

| Format / behavior | Official reference | Decision |
| --- | --- | --- |
| Cursor manifest and discovery | [Plugins reference](https://cursor.com/docs/reference/plugins) | `.cursor-plugin/plugin.json`, shared skills, explicit `mcpServers` file override |
| Cursor installation | [Plugins](https://cursor.com/docs/plugins) | Cursor Marketplace, or a local install from source |
| Cursor schema | [plugin.schema.json](https://github.com/cursor/plugins/blob/main/schemas/plugin.schema.json), [marketplace.schema.json](https://github.com/cursor/plugins/blob/main/schemas/marketplace.schema.json), [plugin template](https://github.com/cursor/plugin-template) | Use the upstream schemas for validation; no fabricated `$schema` identifier |
| Claude Code plugin | [Manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference), [plugins reference](https://code.claude.com/docs/en/plugins-reference) | Standard skills and `.mcp.json` auto-discovery; no duplicate explicit discovery paths |
| Claude Code marketplace | [Marketplace guide](https://code.claude.com/docs/en/plugin-marketplaces) | Relative `./` source is the repository root; top-level `description` is supported and `metadata.description` is backward-compatible |
| Claude Code MCP | [MCP servers](https://code.claude.com/docs/en/mcp-servers) | `type: http`, browser OAuth |
| Codex plugin and catalog | [Package your plugin](https://developers.openai.com/plugins/build/plugins), [sample spec](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/plugin-creator/references/plugin-json-spec.md) | Supported `.codex-plugin` compatibility layout; catalog `interface.displayName` belongs in the root `interface` object, not on a plugin entry |
| Codex MCP | [MCP](https://developers.openai.com/codex/mcp), [CLI add example](https://developers.openai.com/learn/docs-mcp) | Manual MCP-only fallback for clients without plugin support |
| Gemini extension / skills | [Extension reference](https://geminicli.com/docs/extensions/reference/) | Root `gemini-extension.json`, `skills/` discovery |
| Gemini MCP / OAuth | [MCP servers](https://geminicli.com/docs/tools/mcp-server/) | `httpUrl` for Streamable HTTP; automatic OAuth discovery; no `trust` bypass |
| ChatGPT connector | [Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) | Remote MCP registration, not legacy `ai-plugin.json` |

Each client reads its own documented native or compatibility manifest rather
than the newer portable Agent Plugins format, so no client sees two root
manifests.

## Repeatable checks

Run from the repository root (Node 20+):

```sh
node scripts/validate.mjs
git diff --check
```

The local validator checks JSON parsing, synchronized versions/names, declared
component paths (including the Cursor logo), marketplace root sources, skill
frontmatter, and the credential-free endpoint/transport shapes. It also rejects
unknown manifest fields for the subset used here. It is a repository
consistency check, not a reimplementation of every upstream schema.

With Claude Code installed, also run:

```sh
claude plugin validate .
claude plugin validate .claude-plugin/marketplace.json
```

Validate the Cursor plugin and marketplace against the upstream JSON Schemas
linked above with a Draft 7 JSON Schema validator with format checks. The
`scripts/validate-template.mjs` script from the Cursor plugin template can also
be run from this repository's root.
