#!/usr/bin/env node
// Packs a build of the MTB Physics Playground into the single HTML file that
// members open through tool.html (it is a members-only tool; see docs/ACCESS.md).
//
// The Playground is a React app with its own repository (wcmalfeld/mtb-physics).
// After changing it there:
//   1. in that folder:   npm run build
//   2. in this folder:   node scripts/import-playground.mjs /path/to/mtb-physics/dist
//   3. upload it:        node scripts/admin.mjs upload private-tools/physics-playground/index.html physics-playground/index.html
//   4. node scripts/check-site.mjs
//
// What it does: inlines the build's one script and one stylesheet into its
// index.html, and adds a line that lets the app find window.MathleteProgress
// on the player page (tool.html loads js/progress.js; the app runs in an
// iframe inside it). The result goes to private-tools/physics-playground/,
// which is git-ignored, so it is never published with the site.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const outDir = root + 'private-tools/physics-playground/';
const src = process.argv[2] && resolve(process.argv[2]);

function die(msg) { console.error('\n  ' + msg + '\n'); process.exit(1); }
if (!src) die('Usage: node scripts/import-playground.mjs /path/to/mtb-physics/dist');
if (!existsSync(src + '/index.html') || !existsSync(src + '/assets')) die(`${src} doesn't look like a Playground build (no index.html and assets/). Run "npm run build" there first.`);

let html = readFileSync(src + '/index.html', 'utf8');
const scripts = [...html.matchAll(/<script type="module"[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/g)];
const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/g)];
if (scripts.length !== 1 || styles.length > 1) die('Expected one module script and at most one stylesheet in the build\'s index.html.');

const js = readFileSync(src + '/assets/' + scripts[0][1], 'utf8');
if (/<\/script/i.test(js)) die('The script contains "</script", so it can\'t be inlined safely.');
if (/\bimport\(/.test(js)) die('The build has lazy-loaded chunks (import(...)); a single-file tool can\'t load them. Turn code splitting off in the Playground and rebuild.');
const css = styles.length ? readFileSync(src + '/assets/' + styles[0][1], 'utf8') : '';
if (/<\/style/i.test(css)) die('The stylesheet contains "</style", so it can\'t be inlined safely.');
if (/url\((?!["']?data:)/.test(css)) die('The stylesheet loads files with url(...); those won\'t resolve in a single-file tool.');

// A build copied from an older public copy of the site may still carry
// the site scripts and the canonical link it used to have; drop them.
html = html
  .replace(/\s*<!-- Added by scripts\/import-playground\.mjs[\s\S]*?-->/, '')
  .replace(/\s*<script src="\.\.\/\.\.\/js\/[^"]+"><\/script>/g, '')
  .replace(/\s*<link rel="canonical"[^>]*>/, '');

const shim = '<script>/* Added by scripts/import-playground.mjs: use the player page\'s progress tracking. */try{if(!window.MathleteProgress&&window.parent!==window)window.MathleteProgress=window.parent.MathleteProgress;}catch(e){}</script>';
html = html
  .replace(scripts[0][0], () => shim + '\n    <script type="module">' + js + '</script>')
  .replace(styles.length ? styles[0][0] : '\u0000', () => '<style>' + css + '</style>');

mkdirSync(outDir, { recursive: true });
writeFileSync(outDir + 'index.html', html);

console.log(`\n  Packed ${src} -> private-tools/physics-playground/index.html (${Math.round(html.length / 1024)} KB)`);
if (!js.includes('MathleteProgress')) console.log('  WARNING: this build has no progress tracking in it (src/progress.tsx missing?). Students\' answers will not be saved.');
console.log('  Next: node scripts/admin.mjs upload private-tools/physics-playground/index.html physics-playground/index.html\n');
