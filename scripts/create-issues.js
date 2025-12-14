#!/usr/bin/env node
// Script to create issues on GitHub from templates.
// Usage:
//  - Dry run (default): node create-issues.js --section frontend
//  - Create on GitHub: GITHUB_TOKEN=xxx node create-issues.js --section frontend --create
// Environment variables:
//  - GITHUB_TOKEN: required if --create is used
//  - GITHUB_REPOSITORY: optional (owner/repo), will default to Social-Posts/one-post-nft

const fs = require('fs');
const path = require('path');
const process = require('process');

const BASE_DIR = __dirname;
const TEMPLATES_PATH = path.join(BASE_DIR, 'issue-templates.json');

function usage() {
  console.log(`Usage: node create-issues.js [--section frontend|smartcontract|all] [--create] [--limit N]`);
  console.log(`
Options:
  --section      Which section of templates to use (frontend|smartcontract|all). Default: all
  --create       Actually create issues on GitHub. Without this flag the script will only print what it would do (dry-run).
  --limit N      Limit number of issues to create from each section (useful for testing).
  Environment variables:
    GITHUB_TOKEN        Required if using --create
    GITHUB_REPOSITORY   owner/repo (default: Social-Posts/one-post-nft)
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  const sectionArgIndex = args.indexOf('--section');
  const section = sectionArgIndex !== -1 ? args[sectionArgIndex + 1] : 'all';
  const doCreate = args.includes('--create');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? Number(args[limitIndex + 1]) : undefined;

  const repo = process.env.GITHUB_REPOSITORY || 'Social-Posts/one-post-nft';
  const token = process.env.GITHUB_TOKEN;

  const templatesRaw = fs.readFileSync(TEMPLATES_PATH, 'utf8');
  const templates = JSON.parse(templatesRaw);

  const sectionsToRun = [];
  if (section === 'all') {
    sectionsToRun.push('frontend', 'smartcontract');
  } else if (section === 'frontend' || section === 'smartcontract') {
    sectionsToRun.push(section);
  } else {
    console.error('Unknown --section value');
    usage();
    process.exit(1);
  }

  for (const s of sectionsToRun) {
    const items = templates[s] || [];
    const toCreate = typeof limit === 'number' ? items.slice(0, limit) : items;
    console.log(`\nSection: ${s} - ${toCreate.length} issues`);
    for (const it of toCreate) {
      console.log('---');
      console.log('Title:', it.title);
      console.log('Labels:', (it.labels || []).join(', '));
      console.log('Body:\n', it.body);

      if (doCreate) {
        // Prefer using the `gh` CLI for creating issues.
        const { execFileSync } = require('child_process');
        const os = require('os');
        const tmpPath = path.join(os.tmpdir(), `issue-${Date.now()}.md`);
        try {
          fs.writeFileSync(tmpPath, it.body, 'utf8');
          const args = ['issue', 'create', '--repo', repo, '--title', it.title, '--body-file', tmpPath];
          (it.labels || []).forEach((l) => args.push('--label', l));
          console.log('\nRunning: gh ' + args.map(a => (a.includes(' ') ? `"${a}"` : a)).join(' '));
          execFileSync('gh', args, { stdio: 'inherit' });
        } catch (err) {
          console.error('Failed to create issue with gh:', err.message || err);
          console.error('Make sure `gh` is installed and authenticated: `gh auth login`');
          process.exitCode = 3;
        } finally {
          try { fs.unlinkSync(tmpPath); } catch (_) {}
        }
      }
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
