# Roadmap

## v1.0.0 (released)

- Published the core Claude Code, Cursor, Skill, and plugin files.
- Added worked examples for common coding-agent failure modes.
- Validated the plugin marketplace layout.
- Documented install paths for Claude Code and Cursor.

## v1.1.0

- Added Codex repository and user skill install guidance.
- Replaced version-specific Claude Code and Cursor claims.
- Added validation for JSON, YAML/frontmatter, and synced `SKILL.md` copies.
- Added GitHub Actions validation for pushes and pull requests.
- Added issue templates for failure modes and tool compatibility.

## v1.2.0

- Cut the always-loaded rules to a short core shared by `CLAUDE.md`,
  `AGENTS.md`, the Cursor rule, and the skill.
- Added a rule to ask before irreversible actions.
- Moved Claude Code reference material to `docs/CLAUDE_CODE_NOTES.md`.

## Unreleased

- Measured the core against no instruction file with Claude Code and Codex.
  See [evals](../evals/README.md).
- Ask before removing exported or public APIs. The evals showed v1.2
  removing a public library method as dead code.

## Next

- Add more examples from real TypeScript, Python, and infrastructure tasks.
- Add team rollout guidance for organizations.

## Later

- Add a short walkthrough for the README.
- Add tool-specific adapters for other coding agents.
- Add a comparison matrix for project memories, rules, skills, and plugins.
- Collect community examples from maintainers using the repo in production.
