# Contributing

Contributions are welcome when they make the guidelines sharper, more accurate,
or easier to install.

## Good contributions

- A concrete failure mode with a before/after example.
- Cleaner wording that removes ambiguity.
- Install notes for another coding-agent tool.
- Plugin or Cursor compatibility fixes.
- Docs that help teams adopt the rules without slowing down.

## Keep changes scoped

This repo is itself governed by the guidelines it ships:

- Read the relevant file before editing.
- Make the smallest useful change.
- Avoid drive-by rewrites.
- Verify JSON manifests when changing plugin files.
- Update README/docs when install paths change.

## Local checks

```bash
node scripts/validate.mjs
python3 -I -B evals/test_run_ab.py
```

Ruby must be available on `PATH` for the YAML checks.

If Claude Code is available, also run:

```bash
claude plugin validate .
```

## Pull requests

Keep PRs focused. A PR that adds one excellent example is better than a broad
rewrite of every rule.
