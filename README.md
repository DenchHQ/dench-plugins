# Dench

[Dench](https://dench.com) is an AI revenue engine that finds, reaches, and
closes customers, and also works as your CRM.

This plugin connects your AI agent to your Dench workspace. Once it's installed,
your agent can:

- Look up and update people, companies, deals, tasks, and custom records.
- Read workspace context, notes, activity, and memory.
- Find leads and manage outreach campaigns.
- Run actions in the apps you've connected to Dench.

The plugin contains two skills, [`dench-mcp`](skills/dench-mcp/SKILL.md) and
[`dench-cli`](skills/dench-cli/SKILL.md), plus the Dench server connection.
It ships no executables, install hooks, or credentials.

## Install

### Cursor

Install **Dench** from the Cursor Marketplace.

To install from source instead, clone this repository into Cursor's local
plugin directory, then restart Cursor or run **Developer: Reload Window**:

```sh
mkdir -p ~/.cursor/plugins/local
git clone https://github.com/DenchHQ/dench-plugins.git ~/.cursor/plugins/local/dench
```

### Claude Code

```text
/plugin marketplace add DenchHQ/dench-plugins
/plugin install dench@dench-plugins
```

Then run `/mcp` to sign in. Skills appear as `/dench:dench-mcp` and
`/dench:dench-cli`.

### Codex and Gemini CLI

Clone the repository into a directory named `dench`, then add it:

```sh
git clone https://github.com/DenchHQ/dench-plugins.git dench
codex plugin marketplace add "$PWD/dench"   # Codex
gemini extensions install "$PWD/dench"      # Gemini CLI
```

In Codex, install `dench` from the plugin browser. In Gemini CLI, restart and
run `/mcp auth dench` if asked to sign in.

### Other clients

Any client that supports remote MCP servers with OAuth (for example Claude or
ChatGPT custom connectors) can add `https://mcp.dench.com/mcp` directly. This
adds the Dench tools but not the skills. Don't add the server both this way and
through the plugin.

## Sign in

Dench uses OAuth, so there are no API keys or tokens to paste into your
config. The server is `https://mcp.dench.com/mcp` (Streamable HTTP).

The first time your agent connects, your client opens Dench in the browser.
Choose a workspace and what the agent may do:

- **Read** (always on): workspace context, CRM records, notes, tasks, and memory.
- **Write** (optional): create and update records, notes, tasks, and memory.
- **Actions** (optional): run actions in your connected apps.
- **Outreach** (optional, off by default): manage campaigns and send email.

In Cursor, use the Dench server's connect button in MCP settings if the browser
doesn't open on its own.

Each sign-in covers one workspace. To revoke access, go to **Dench → Settings →
API keys → Connected AI apps**. Uninstalling the plugin does not revoke it.

## Approvals

Sending email, adding people to a campaign, launching or resuming a campaign,
and any connected-app action that changes something go through Dench approvals.
The agent's first attempt only creates a request; nothing runs until you
approve it in Dench, and each approval is good for one run. There are no delete
tools, and the agent cannot approve its own requests.

CRM edits (records, notes, tasks, memory) apply right away. Leave **Write**
unchecked if you want read-only access.

## Dench CLI

The `dench-cli` skill uses the published `@dench.com/cli` package (Node.js 20+):

```sh
npx -y -p @dench.com/cli dench signin --name "AI Agent - Dench"
npx -y -p @dench.com/cli dench status --mine --json
```

You approve the sign-in in the browser. CLI sign-in and the plugin's OAuth
sign-in are separate; neither grants the other.

## Privacy and support

The plugin sends the tool inputs your agent chooses to Dench and returns
workspace data to your client. Connected-app actions can send data to those
apps. The plugin adds no telemetry. See the
[Dench privacy policy](https://www.dench.com/privacy).

Support: [support@dench.com](mailto:support@dench.com)

## Development

```sh
node scripts/validate.mjs
git diff --check
```

Manifests for each client live in `.cursor-plugin/`, `.claude-plugin/`,
`.codex-plugin/`, `.agents/plugins/`, and `gemini-extension.json`; they share
`skills/` and `.mcp.json`. Format sources and validation notes are in
[docs/formats.md](docs/formats.md).

## License

[MIT](LICENSE). The license covers this repository, not the Dench service.
