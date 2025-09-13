#!/usr/bin/env node
/**
 * Release orchestrator
 * Steps:
 * 1. Lint
 * 2. Run tests
 * 3. Bump version (if --version X.Y.Z passed)
 * 4. Package (with manifest version)
 */
const { execSync } = require('child_process');

function run(cmd, msg) {
  console.log(`\n▶ ${msg}`);
  execSync(cmd, { stdio: 'inherit' });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--version' && args[i+1]) { out.version = args[i+1]; i++; }
  }
  return out;
}

(function main() {
  const opts = parseArgs();
  run('npm run lint', 'Linting');
  run('npm test', 'Running tests');
  if (opts.version) {
    run(`npm run version:bump ${opts.version}`, `Bumping version to ${opts.version}`);
  }
  run('npm run package -- --use-manifest-version', 'Packaging');
  console.log('\n✅ Release pipeline complete');
})();
