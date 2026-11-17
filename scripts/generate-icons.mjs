#!/usr/bin/env node
// Regenerates the app icon, Android adaptive icon, splash logo, notification icon and
// favicon from the FTC SVGs in assets/. Run after changing the mark or logo:
//   node scripts/generate-icons.mjs
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'assets', 'images');
const BG = '#0C0A18';
const mark = readFileSync(join(ROOT, 'assets', 'ftc-mark-white.svg'));
const logo = readFileSync(join(ROOT, 'assets', 'ftc-logo-white.svg'));

/** Renders an SVG at `height` px tall (keeps its aspect ratio). */
// Both SVGs have large viewBoxes (~1000px tall), so 2× density is plenty before downscaling.
const raster = (svg, height) => sharp(svg, { density: 144 }).resize({ height }).png().toBuffer();

/** A `size`×`size` canvas (solid `bg` or transparent) with the SVG centred at `fraction` of the height. */
async function square(file, svg, size, fraction, bg) {
  const art = await raster(svg, Math.round(size * fraction));
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toFile(join(OUT, file));
  console.log(`✓ assets/images/${file}`);
}

// iOS / default icon: white mark on the app background (no transparency allowed on iOS).
await square('icon.png', mark, 1024, 0.56, BG);
// Android adaptive icon: the mark must sit inside the 66% safe zone of the 108dp layer.
await square('android-icon-foreground.png', mark, 1024, 0.42);
await square('android-icon-monochrome.png', mark, 1024, 0.42);
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BG } })
  .png()
  .toFile(join(OUT, 'android-icon-background.png'));
console.log('✓ assets/images/android-icon-background.png');
// Android status-bar notification icon: white silhouette on transparent, 96×96.
await square('notification-icon.png', mark, 96, 0.8);
// Web favicon.
await square('favicon.png', mark, 48, 0.7, BG);

// Splash: the full white logo on a transparent canvas; app.json sets the background colour.
const splash = await raster(logo, 340);
await sharp(splash).png().toFile(join(OUT, 'splash-logo.png'));
console.log('✓ assets/images/splash-logo.png');
