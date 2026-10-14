# Dench plugins and connectors

Official client packages for [Dench](https://dench.com), the AI CRM. Two shared
skills teach agents to use the Dench CLI and the remote MCP server.

**Private preview.** This repository must stay **PRIVATE** until Mark explicitly
authorizes otherwise. Nothing here publishes a marketplace listing or changes
repository visibility. Installers need access to this private repository.

**MCP deployment prerequisite:** the endpoint below depends on the not-yet-merged
[Dench MCP server PR](https://github.com/DenchHQ/dench.com/pull/1273), production
DNS/TLS, and backend deployment. Packaging validation does **not** establish that
the production endpoint works. CLI sign-in is independent of this deployment.

> Logo: TODO — approved Dench logo, light/dark variants, and marketplace icon.
> See [asset placeholders](assets/README.md). No placeholder is advertised as a
> finished logo in the manifests.

## Contents

| Client | Package |
| --- | --- |
| Cursor | `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`; explicit shared `.mcp.json` path |
| Claude Code | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`; auto-discovers `.mcp.json` and `skills/` |
| Codex | `.codex-plugin/plugin.json` (supported compatibility format), `.agents/plugins/marketplace.json` |
| Gemini CLI | `gemini-extension.json`; native `httpUrl` transport and shared `skills/` discovery |
| Claude, ChatGPT, Grok, Muse | Remote connector setup/status below; not claimed to be listed |

Skills: [`dench-cli`](skills/dench-cli/SKILL.md) and
[`dench-mcp`](skills/dench-mcp/SKILL.md). There are no bundled executables, install
hooks, credentials, or local MCP proxy. Node.js 20+ and npm/npx are required only
for the CLI skill, not remote MCP.

## Private installation

Use authenticated Git access without embedding a token in the clone URL. Review
the plugin files before enabling them. After PR #1 merges, `main` is the default
install. Reviewers installing before then can select the PR ref explicitly. The
checkout directory is named `dench`, which also matches Gemini CLI's extension
name requirement:

```sh
git clone --branch main https://github.com/DenchHQ/dench-plugins.git dench
cd dench
```

The examples below use `/absolute/path/to/dench` as a placeholder for this
checkout. Do not install the same MCP server through both a plugin and a manual
client config.

### Cursor

For a local plugin, clone `main` into Cursor's local plugin directory
(if `dench` already exists, update that checkout rather than overwriting it):

```sh
mkdir -p ~/.cursor/plugins/local
git clone --branch main https://github.com/DenchHQ/dench-plugins.git ~/.cursor/plugins/local/dench
```

Restart Cursor or run **Developer: Reload Window**. Verify the `dench-cli` and
`dench-mcp` skills and the Dench MCP server are available. Use the server's
authentication/connect control to authorize with Dench in your browser.

For a private team marketplace, an admin can use **Dashboard → Plugins & MCPs →
Team Marketplaces → Add Marketplace → Import from Repo**, select this repository
and the intended ref, and review marketplace access before enabling it. Keep
distribution restricted to the authorized review team; do not submit publicly.

MCP-only alternative: merge the `mcpServers.dench` entry from `.mcp.json` into
your existing `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (user). Preserve
other servers. This does not install the skills.

### Claude Code

Load the checked-out plugin directly for review:

```sh
claude --plugin-dir /absolute/path/to/dench
```

Or register the local marketplace inside Claude Code:

```text
/plugin marketplace add /absolute/path/to/dench
/plugin install dench@dench-plugins
```

After an approved merge, repository-access holders can register
`/plugin marketplace add DenchHQ/dench-plugins` instead. Use `/mcp` to authenticate
the plugin-provided server. Skills are namespaced as `/dench:dench-cli` and
`/dench:dench-mcp`.

MCP-only alternative (no plugin skills):

```sh
claude mcp add --transport http dench https://mcp.dench.com/mcp
```

Then run `/mcp` in Claude Code and follow browser authorization.

### Codex

On a version with plugin marketplace support, add the local catalog:

```sh
codex plugin marketplace add /absolute/path/to/dench
```

Use the supported plugin browser to select `dench` from `dench-plugins`, install
it, and complete OAuth. The official packaging guide recommends the desktop app
for local plugin installation/testing. Client availability varies by version;
check `codex plugin --help`. The `.codex-plugin` compatibility layout is
intentional; it shares the same skills and MCP file as the other clients.

For versions without plugin support, use the documented MCP-only path:

```sh
codex mcp add dench --url https://mcp.dench.com/mcp
codex mcp login dench
```

This fallback does not load plugin skills. Use `/mcp` to inspect the connection.

### Gemini CLI

Link the local checkout. Its directory name must be `dench`, matching the
extension's manifest name:

```sh
gemini extensions link /absolute/path/to/dench
gemini extensions list
```

Restart Gemini CLI. Check `/skills list` and `/mcp`; if authentication is needed,
run `/mcp auth dench` and complete the browser flow. The extension uses `httpUrl`
(Streamable HTTP), not Gemini's SSE `url` field. OAuth discovery needs no embedded
client secret. For a fixed local installation rather than a live development
link, use `gemini extensions install /absolute/path/to/dench`.

### Claude (web/desktop connector)

Where custom connectors are enabled for your account, use **Settings → Connectors
→ Add custom connector**, enter `https://mcp.dench.com/mcp`, and authorize Dench.
This installs neither the Claude Code plugin nor its CLI skill. A directory
listing is separate and remains TODO.

### ChatGPT apps / connectors

Where your plan and admin policy permit, enable developer mode under **Settings
→ Apps & Connectors → Advanced settings**, then create a connector with the MCP
URL `https://mcp.dench.com/mcp` and OAuth authentication. Authorize the intended
workspace and test in a new conversation. UI labels can vary by rollout.

This is a developer connector, **not** an approved ChatGPT directory listing.
No legacy `ai-plugin.json` is supplied: current Apps SDK integration is through
the remote MCP server, with submission metadata/review handled separately.

ChatGPT desktop clients that discover both `.claude-plugin/marketplace.json` and
`.agents/plugins/marketplace.json` may show Dench twice. These catalogs describe
the same root package; do not install or authorize both listings, and do not
assume the client deduplicates them.

### Grok

For **Grok Build**, official MCP documentation supports:

```sh
grok mcp add --transport http dench https://mcp.dench.com/mcp
```

Complete the browser OAuth flow when requested. This is not a claim of support
or listing in the consumer Grok app. The xAI API also supports remote MCP, but its
request configuration and token handling belong in the calling application, not
in a public plugin manifest. TODO: confirm the desired Grok surface, directory
submission path, and client-specific OAuth compatibility.

### Muse

TODO: confirm Muse's developer/partner submission process, Dench OAuth
compatibility, and any official package format. Meta documents connectors, but
we have not verified a public installable manifest standard or a Dench listing.
The integration target is `https://mcp.dench.com/mcp`; do not invent a marketplace
URL or ask users to paste access tokens into a conversation.

## CLI quick start

The npm package is **`@dench.com/cli`**; its binary is **`dench`**. Select the binary
explicitly because the package has multiple binaries:

```sh
npx -y -p @dench.com/cli dench signin --name "AI Agent - Dench CRM"
npx -y -p @dench.com/cli dench status --mine --json
npx -y -p @dench.com/cli dench context --json
npx -y -p @dench.com/cli dench crm entries list task --json
```

The human approves sign-in in the browser with the intended workspace selected.
If sessions already exist, first run `dench sessions` using the same npx prefix;
select with `dench use <session-key-or-workspace-slug>` rather than guessing.
Tasks are CRM entries; there is no `dench tasks` command.

Normal local sign-in requires **no environment variables**. `DENCH_HOST` can
override the default `https://dench.com` backend. `DENCH_SESSION_KEY` optionally
names a stable long-lived agent. `DENCH_AGENT_SESSION_TOKEN` and `DENCH_API_KEY`
are credentials for provisioned environments; they are not required by these
manifests. Never print or commit them. See the [CLI skill](skills/dench-cli/SKILL.md)
for selection and safety rules.

## MCP authorization and limitations

- Endpoint: `https://mcp.dench.com/mcp`; transport: **Streamable HTTP**.
- OAuth 2.1: DCR + CIMD, PKCE S256, rotating refresh tokens. Let clients discover
  metadata; no shared client secret or hard-coded bearer header is needed.
- `dench:read`: workspace context and rules, CRM records and metadata,
  notes/activity, tasks, memory search, approval reads, and knowledge search.
- `dench:write`: create/update records, add notes, create/complete tasks, save
  memory, replace workspace rules, and request approvals.
- `dench:actions`: discover connected apps and run their actions.
- `dench:outreach`: opt-in campaign management, email sending, and inbox reads.
  This scope is available only after a server release exposes it; Dench MCP
  PR #1273 is adding the scope.
- `dench:read` is required; `dench:write`, `dench:actions`, and
  `dench:outreach` are optional consent choices. Inspect the live `tools/list`
  response and each tool's live input schema to determine the capabilities
  granted by the current server release. There are no delete or
  approval-decision tools.
- The grant is bound to one workspace. CLI sign-in does not grant MCP access and
  vice versa. Neither should bypass the other's consent.
- **Writes can change live CRM data without a separate human-approval gate.**
  Workspace rules are replaced, not appended. External actions preserve Dench's
  approval policy. Start read-only and review intended changes.
- Before sending email or launching a campaign, obtain explicit user approval
  for the exact senders, recipients, and content. Read the live launch preview
  before launching. Never fabricate a required LinkedIn risk acknowledgement;
  obtain the actual human acknowledgement when required.
- Revoke a grant in **Dench → Settings → API keys → Connected AI apps**. Removing
  a plugin or disconnecting a client may not revoke its server-side grant.

## Privacy, support, and release checklist

The client sends selected tool inputs to Dench and receives workspace data; its
model provider may process that returned data under the client's own policies.
Connected-app actions can send data to third-party services. These manifests
add no telemetry or credential collection, but they do not replace Dench's or
the client's privacy terms.

- TODO: approved privacy policy URL, terms URL, support contact/channel, and
  security reporting contact. Until supplied, contact your Dench administrator;
  no guessed addresses or policy links are included.
- TODO: approved logos/icons, screenshots, listing copy, and reviewer test account.
- TODO: approved Codex plugin interface metadata, including display copy, icons,
  and privacy/terms URLs required by the official spec. This is separate from
  the `displayName` on the Codex marketplace catalog.
- Cursor's public marketplace requires an open-source plugin, so public listing
  is blocked while this repository is private. Continue to use only approved
  local/private-team installs; do not change repository visibility.
- TODO: merge/deploy the MCP server, configure DNS/TLS, and verify OAuth discovery,
  consent, refresh, revocation, narrowed scopes, and approval-gated actions with
  each target client, including the desktop catalog acceptance test in
  [docs/formats.md](docs/formats.md).
- TODO: Mark's explicit authorization before any public release, repository
  visibility change, or directory submission. Do not publish this preview.

## Development and validation

```sh
node scripts/validate.mjs
git diff --check
claude plugin validate .
claude plugin validate .claude-plugin/marketplace.json
```

The first command is dependency-free repository consistency validation, **not**
an official cross-client schema validator. CI runs it plus a whitespace check;
running the script with Node also parses its JavaScript. The Claude commands
require Claude Code. Official format
sources, schema validation instructions, and validation boundaries are in
[docs/formats.md](docs/formats.md). There is no compiled application or TypeScript
build. Live OAuth/client acceptance testing remains a release prerequisite.

## License

[MIT](LICENSE) applies to the contents of this repository, not to the Dench
service or the private dench.com source. License choice does not authorize making
this repository public.
