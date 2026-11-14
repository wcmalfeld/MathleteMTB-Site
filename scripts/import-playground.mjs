#!/usr/bin/env node
// Copies a build of the MTB Physics Playground into this site, so it shares
// the site's login and can save a signed-in student's progress.
//
// The Playground is a React app with its own repository (wcmalfeld/mtb-physics).
// After changing it there:
//   1. in that folder:   npm run build
//   2. in this folder:   node scripts/import-playground.mjs /path/to/mtb-physics/dist
//   3. node scripts/check-site.mjs, then commit and push this site as usual.
//
// What it does: replaces learning-lab/physics-playground/ with the build,
// and adds to its index.html the three site scripts progress tracking needs
// (the app itself only looks for window.MathleteProgress; see src/progress.tsx
// in the Playground). Nothing else in the build is changed.

import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dest = root + 'learning-lab/physics-playground/';
const src = process.argv[2] && resolve(process.argv[2]);

function die(msg) { console.error('\n  ' + msg + '\n'); process.exit(1); }
if (!src) die('Usage: node scripts/import-playground.mjs /path/to/mtb-physics/dist');
if (!existsSync(src + '/index.html') || !existsSync(src + '/assets')) die(`${src} doesn't look like a Playground build (no index.html and assets/). Run "npm run build" there first.`);

let html = readFileSync(src + '/index.html', 'utf8');
if (/(src|href)="\//.test(html)) die('The build uses absolute paths ("/assets/..."). Keep base: "./" in the Playground\'s vite.config.ts and rebuild.');
if (!html.includes('</head>')) die('Unexpected index.html: no </head>.');

const inject = `    <meta name="description" content="Launch a rider off a jump, predict the landing, then see the projectile-motion math that explains it.">
    <link rel="canonical" href="https://www.mathletemtb.com/learning-lab/physics-playground/">
    <!-- Added by scripts/import-playground.mjs: saves a signed-in student's
         answers to their Mathlete account. The app works the same without them. -->
    <script src="../../js/supabase-config.js"></script>
    <script src="../../js/auth.js?v=8"></script>
    <script src="../../js/progress.js?v=3"></script>
  </head>`;
html = html.replace('</head>', inject.trimStart());

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
writeFileSync(dest + 'index.html', html);

const js = readFileSync(dest + 'assets/' + html.match(/assets\/(index-[^"]+\.js)/)[1], 'utf8');
console.log(`\n  Copied ${src} -> learning-lab/physics-playground/`);
if (!js.includes('MathleteProgress')) console.log('  WARNING: this build has no progress tracking in it (src/progress.tsx missing?). Students\' answers will not be saved.');
console.log('  Next: node scripts/check-site.mjs, then commit and push.\n');
