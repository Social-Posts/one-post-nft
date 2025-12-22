#!/usr/bin/env bash
set -euo pipefail

# Helper to run slither and forge tests locally and emit artifacts
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Running Slither (if installed)"
if command -v slither >/dev/null 2>&1; then
  slither . --json slither-report.json || true
  echo "Slither report: $ROOT/slither-report.json"
else
  echo "Slither not found. Install with: pip install slither-analyzer"
fi

echo "==> Running forge tests"
if command -v forge >/dev/null 2>&1; then
  forge test
else
  echo "Foundry (forge) not found; install Foundry: https://book.getfoundry.sh/"
fi

echo "Audit helper finished."
