#!/usr/bin/env node
/**
 * Version bump utility
 * Usage:
 *   node scripts/version-bump.js 1.2.3
 * - Updates CSXS/manifest.xml ExtensionBundleVersion and Extension Version
 * - Updates menu title version segment (pattern vX.Y.Z)
 */
const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Provide semantic version, e.g. 1.2.3');
  process.exit(1);
}

const manifestPath = path.join(process.cwd(), 'CSXS', 'manifest.xml');
if (!fs.existsSync(manifestPath)) {
  console.error('manifest.xml not found');
  process.exit(1);
}

let xml = fs.readFileSync(manifestPath, 'utf8');

// Update ExtensionBundleVersion attribute
xml = xml.replace(/ExtensionBundleVersion="[^"]+"/, `ExtensionBundleVersion="${newVersion}"`);

// Update Extension Version attribute
xml = xml.replace(/<Extension Id="([^"]+)" Version="[^"]+"\s*\/>/, `<Extension Id="$1" Version="${newVersion}" />`);

// Update Menu title version pattern vX.Y.Z
xml = xml.replace(/(Menu>.*?v)\d+\.\d+\.\d+/, (m, p1) => `${p1}${newVersion}`);

fs.writeFileSync(manifestPath, xml, 'utf8');
console.log(`Updated manifest versions to ${newVersion}`);