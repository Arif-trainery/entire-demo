# entire-demo

A demo project showcasing **[Entire CLI](https://github.com/entireio/cli)** — a tool that captures AI coding sessions, creates rewindable checkpoints, and stores session metadata separately from your code.

## What is Entire CLI?

Entire integrates with your Git workflow to record AI agent sessions (Claude Code or Gemini CLI). It creates a searchable history of *how* code was written — linking sessions with commits — while keeping your actual code history clean.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Sessions** | Complete AI interactions from start to finish, stored on a separate branch |
| **Checkpoints** | Snapshots within a session you can rewind to (like save points) |
| **Dual Branches** | Code stays on your branch; metadata goes to `entire/checkpoints/v1` |
| **Strategies** | `manual-commit` (checkpoints on git commit) or `auto-commit` (checkpoints on every agent response) |

## Setup

### Install Entire CLI

```sh
brew tap entireio/tap
brew install entireio/tap/entire
```

### Enable in a Git repo

```sh
# Manual-commit strategy (default) — checkpoints on each git commit
entire enable --strategy manual-commit --agent claude-code

# Auto-commit strategy — checkpoints after every agent response
entire enable --strategy auto-commit --agent claude-code
```

### Configuration

Entire creates `.entire/settings.json` (shared, committed) and optionally `.entire/settings.local.json` (personal, gitignored).

```json
{
  "strategy": "auto-commit",
  "enabled": true
}
```

Settings can also include:
- `log_level`: `debug` | `info` | `warn` | `error`
- `strategy_options.push_sessions`: auto-push checkpoint branch on `git push`
- `strategy_options.summarize.enabled`: auto-generate AI summaries at commit time
- `telemetry`: anonymous usage stats

## Commands Reference

| Command | What it does |
|---------|-------------|
| `entire enable` | Initialize Entire in a repo (installs 7 Claude Code hooks) |
| `entire status` | Show current session & strategy info |
| `entire explain --commit HEAD` | Summarize what happened in a commit's session |
| `entire explain --session <id>` | Summarize a full session |
| `entire rewind` | Browse checkpoints and roll back to one |
| `entire resume <branch>` | Restore the latest checkpointed session for a branch |
| `entire doctor` | Diagnose and fix stuck sessions |
| `entire clean` | Remove orphaned session data |
| `entire reset` | Clear shadow branch for current commit (manual-commit only) |
| `entire disable` | Remove all hooks and disable Entire |
| `entire version` | Show version info |

### Debug mode

```sh
ENTIRE_LOG_LEVEL=debug entire status
```

## How Hooks Work

When you run `entire enable`, it installs hooks into `.claude/settings.json`:

| Hook | When it fires |
|------|--------------|
| `SessionStart` | Claude Code session begins |
| `SessionEnd` | Claude Code session ends |
| `UserPromptSubmit` | User sends a prompt |
| `Stop` | Agent stops |
| `PreToolUse (Task)` | Before a Task tool runs |
| `PostToolUse (Task)` | After a Task tool completes |
| `PostToolUse (TodoWrite)` | After a TodoWrite tool completes |

These hooks call `entire hooks claude-code <event>` to capture session data.

## What's in this repo

A small CLI task manager (`taskflow`) built incrementally to generate real commit history:

```
src/
  index.js       # CLI with add/list/done/remove/search/stats/export
  store.js       # JSON file-based task storage
  store.test.js  # Unit tests
```

### Try it

```sh
node src/index.js add "Buy groceries" -p high -t shopping
node src/index.js add "Read a book" -p low -t personal
node src/index.js list
node src/index.js list high          # filter by priority
node src/index.js search groceries
node src/index.js done 1
node src/index.js stats
node src/index.js export md          # export as markdown table
node src/index.js export csv         # export as CSV
```

## Workflow

1. `entire enable` in your repo
2. Work with Claude Code (or Gemini CLI) as normal
3. Entire captures sessions and checkpoints automatically via hooks
4. On `git push`, session logs are pushed to `entire/checkpoints/v1` branch
5. Use `entire explain`, `entire rewind`, or `entire resume` to review and navigate session history
