# Issue creation scripts

This folder contains a small script to create GitHub issues from curated templates for the repository.

Files:

- `issue-templates.json` - contains two arrays (`frontend`, `smartcontract`) with issue templates (title, body, labels).
- `create-issues.js` - Node script that prints or creates issues on GitHub.

Usage (dry-run, recommended):

```bash
node scripts/create-issues.js --section frontend
```

To actually create issues on GitHub (use with care):

Prerequisite: install and authenticate the GitHub CLI `gh` (`https://cli.github.com/`) and run `gh auth login`.

```bash
# create frontend issues for the default repo (prints and runs `gh issue create`)
node scripts/create-issues.js --section frontend --create

# or specify a repository explicitly:
GITHUB_REPOSITORY=owner/repo node scripts/create-issues.js --section frontend --create
```

Notes:
- The script defaults to repository `Social-Posts/one-post-nft` if `GITHUB_REPOSITORY` is not set.
- By default the script runs in dry-run mode and will only print each issue description. Use `--create` to send POST requests to GitHub.
- The tool is designed to be safe for onboarding contributors; review/edit `issue-templates.json` before running `--create`.
