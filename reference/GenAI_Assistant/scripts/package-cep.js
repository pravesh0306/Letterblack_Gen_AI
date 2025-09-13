#!/usr/bin/env node
/*
 * CEP Packaging Script
 * - Reads packaging.config.json
 * - Copies whitelisted files to dist/<name>
 * - Creates zip archive
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function loadConfig() {
	const cfgPath = path.join(process.cwd(), 'packaging.config.json');
	if (!fs.existsSync(cfgPath)) throw new Error('packaging.config.json not found');
	return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function copyRecursive(src, dest) {
	if (!fs.existsSync(src)) return;
	const stat = fs.statSync(src);
	if (stat.isDirectory()) {
		ensureDir(dest);
		for (const entry of fs.readdirSync(src)) {
			copyRecursive(path.join(src, entry), path.join(dest, entry));
		}
	} else {
		ensureDir(path.dirname(dest));
		fs.copyFileSync(src, dest);
	}
}

function matchesPattern(relPath, patterns) {
	// Basic glob support: **, * wildcard
	return patterns.some(p => {
		const regex = new RegExp('^' + p
			.replace(/[-/\\^$+?.()|[\]{}]/g, r => '\\' + r)
			.replace(/\\\\/g, '\\\\')
			.replace(/\*\*/g, '.*')
			.replace(/\*/g, '[^/]*') + '$');
		return regex.test(relPath.replace(/\\/g, '/'));
	});
}

function shouldInclude(relPath, include, exclude) {
	if (!matchesPattern(relPath, include)) return false;
	if (exclude && matchesPattern(relPath, exclude)) return false;
	return true;
}

function collectFiles(root, include, exclude) {
	const results = [];
	function walk(current) {
		for (const entry of fs.readdirSync(current)) {
			const full = path.join(current, entry);
			const rel = path.relative(root, full);
			const stat = fs.statSync(full);
			if (stat.isDirectory()) {
				walk(full);
			} else {
				if (shouldInclude(rel, include, exclude)) results.push(rel);
			}
		}
	}
	walk(root);
	return results;
}

function createZip(distDir, folderName) {
	const zipName = `${folderName}.zip`;
	try {
		// Prefer powershell Compress-Archive on Windows else fallback to zip
		if (process.platform === 'win32') {
			execSync(`powershell -Command "Compress-Archive -Path '${folderName}/*' -DestinationPath '${zipName}' -Force"`, { cwd: distDir });
		} else {
			execSync(`zip -r -q ${zipName} ${folderName}`, { cwd: distDir });
		}
		return path.join(distDir, zipName);
	} catch (e) {
		console.warn('Zip creation failed:', e.message);
		return null;
	}
}

function getManifestVersion() {
	try {
		const manifest = fs.readFileSync(path.join(process.cwd(), 'CSXS', 'manifest.xml'), 'utf8');
		const m = manifest.match(/ExtensionBundleVersion="([^"]+)"/);
		return m ? m[1] : null;
	} catch { return null; }
}

function run() {
	const cfg = loadConfig();
	const root = process.cwd();
	const dist = path.join(root, 'dist');
	ensureDir(dist);
	const useManifest = process.argv.includes('--use-manifest-version');
	const manifestVersion = useManifest ? getManifestVersion() : null;
	const versionSegment = manifestVersion ? `v${manifestVersion}_` : '';
	const dateSegment = new Date().toISOString().slice(0,10);
	const outFolderName = `${cfg.name}_${versionSegment}${dateSegment}`;
	const outRoot = path.join(dist, outFolderName);
	ensureDir(outRoot);

	const files = collectFiles(root, cfg.include, cfg.exclude || []);
	files.forEach(f => {
		copyRecursive(path.join(root, f), path.join(outRoot, f));
	});

	console.log(`Copied ${files.length} files for packaging (version: ${manifestVersion || 'n/a'}).`);
	const zipPath = createZip(dist, outFolderName);
	if (zipPath) console.log('Created archive:', zipPath);
	else console.log('Archive not created (see warnings).');
}

run();
