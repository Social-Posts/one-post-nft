# Contributing

Thanks for your interest in contributing! This project welcomes new contributors and we try to keep issues approachable.

Getting started:

1. Fork the repository and create a feature branch
2. Run the relevant test suite: `forge test` for smart contracts, `yarn test` in `frontend/` for frontend
3. Add tests and documentation for new features or bug fixes
4. Open a pull request and reference related issues

Issue creation helper:

We provide a helper script that contains curated issue templates for both the frontend and smart contract parts of the project. It's located in `scripts/` and is intended to help maintainers create consistent issues for community contributors.

Usage (dry-run):

```bash
node scripts/create-issues.js --section frontend
```

To actually create issues on GitHub (use with caution):

The script uses the GitHub CLI (`gh`) when `--create` is passed, so make sure `gh` is installed and authenticated (`gh auth login`).

```bash
node scripts/create-issues.js --section frontend --create
```

Please open an issue if you need help picking up a task or want to propose additional beginner-friendly issues.
