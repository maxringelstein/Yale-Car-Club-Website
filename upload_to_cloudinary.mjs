/**
 * upload_to_cloudinary.mjs
 * Uploads all site images to Cloudinary using the existing unsigned preset,
 * then rewrites src/data-src paths in index.html to Cloudinary URLs.
 *
 * Usage: node upload_to_cloudinary.mjs
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLOUD_NAME    = 'ddud73mxv';
const UPLOAD_PRESET = 'Campus Spotting';
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const TRANSFORM     = 'q_auto,f_auto,w_1600';

// All local image paths used in index.html (relative to project root)
const IMAGES = [
  // Hero / general
  'brand_assets/general/main_porsche.jpg',
  'brand_assets/general/Logo.png',

  // Photo strip + about
  'brand_assets/events/moda_miami/IMG_0020.jpg',
  'brand_assets/events/moda_miami/IMG_0432.jpg',
  'brand_assets/events/moda_miami/IMG_0284.jpeg',
  'brand_assets/events/moda_miami/IMG_0434.jpg',
  'brand_assets/events/moda_miami/IMG_0478.jpeg',
  'brand_assets/events/moda_miami/IMG_0159.jpg',
  'brand_assets/events/moda_miami/IMG_0542.jpg',
  'brand_assets/events/moda_miami/IMG_0042.jpg',
  'brand_assets/events/moda_miami/IMG_0275.jpg',
  'brand_assets/events/moda_miami/IMG_0407.jpg',
  'brand_assets/events/moda_miami/IMG_0428.jpg',
  'brand_assets/events/moda_miami/IMG_0493.jpeg',

  'brand_assets/events/nyc_cars_coffee/IMG_4296.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_6630.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_6652.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_4366.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_4385.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_6619.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_4345.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_4410.jpg',
  'brand_assets/events/nyc_cars_coffee/IMG_6808.webp',

  // Leadership photos
  'brand_assets/leadership/president_photo.jpg',
  'brand_assets/leadership/vice_president_photo.jpg',
  'brand_assets/leadership/treasurer_photo.jpg',
  'brand_assets/leadership/media1_photo.jpg',
  'brand_assets/leadership/media2_photo.jpg',
];

const MAX_BYTES = 9 * 1024 * 1024; // 9 MB — stay under Cloudinary's 10 MB unsigned limit

function prepareFile(absPath) {
  const stat = fs.statSync(absPath);
  if (stat.size <= MAX_BYTES) return { buffer: fs.readFileSync(absPath), tmp: null };

  // Use sips (macOS built-in) to shrink to max 2400px on longest edge
  const tmp = path.join(os.tmpdir(), `ycar_upload_${Date.now()}${path.extname(absPath)}`);
  execSync(`sips -Z 2400 "${absPath}" --out "${tmp}" -s formatOptions 82`, { stdio: 'pipe' });
  const buffer = fs.readFileSync(tmp);
  return { buffer, tmp };
}

async function uploadImage(localPath) {
  const absPath = path.join(__dirname, localPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`  SKIP (not found): ${localPath}`);
    return null;
  }

  // Build a stable public_id from the local path, strip brand_assets/ prefix
  const publicId = localPath
    .replace(/^brand_assets\//, 'ycar/')
    .replace(/\.[^.]+$/, ''); // strip extension

  const { buffer: fileBuffer, tmp } = prepareFile(absPath);
  const blob = new Blob([fileBuffer]);

  const form = new FormData();
  form.append('file', blob, path.basename(localPath));
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('public_id', publicId);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
  const data = await res.json();

  if (!res.ok) {
    // If public_id is blocked by preset, retry without it (Cloudinary assigns one)
    console.warn(`  WARN: public_id rejected for ${localPath}, retrying without it…`);
    const form2 = new FormData();
    form2.append('file', new Blob([fileBuffer]), path.basename(localPath));
    form2.append('upload_preset', UPLOAD_PRESET);
    form2.append('folder', path.dirname(publicId));
    const res2 = await fetch(UPLOAD_URL, { method: 'POST', body: form2 });
    const data2 = await res2.json();
    if (!res2.ok) {
      console.error(`  ERROR: ${localPath} — ${data2.error?.message}`);
      if (tmp) fs.unlinkSync(tmp);
      return null;
    }
    if (tmp) fs.unlinkSync(tmp);
    return { localPath, publicId: data2.public_id, secureUrl: data2.secure_url };
  }

  if (tmp) fs.unlinkSync(tmp);
  return { localPath, publicId: data.public_id, secureUrl: data.secure_url };
}

function cloudinaryUrl(publicId, transform = TRANSFORM) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

async function main() {
  console.log(`Uploading ${IMAGES.length} images to Cloudinary (cloud: ${CLOUD_NAME})…\n`);

  const mapping = {}; // localPath → cloudinary delivery URL

  for (const localPath of IMAGES) {
    process.stdout.write(`  Uploading ${localPath}… `);
    const result = await uploadImage(localPath);
    if (result) {
      // Use the delivery URL with transforms applied
      mapping[localPath] = cloudinaryUrl(result.publicId);
      console.log(`✓  (${result.publicId})`);
    }
  }

  // Save mapping for reference
  fs.writeFileSync(
    path.join(__dirname, 'cloudinary_map.json'),
    JSON.stringify(mapping, null, 2)
  );
  console.log('\nMapping saved to cloudinary_map.json');

  // Rewrite index.html
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  let replaced = 0;
  for (const [local, cdnUrl] of Object.entries(mapping)) {
    // Match both src="..." and data-src="..." (for deferred gallery images)
    const escapedLocal = local.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(src|data-src)="${escapedLocal}"`, 'g');
    const before = html;
    html = html.replace(re, `$1="${cdnUrl}"`);
    if (html !== before) replaced++;
  }

  // Also rewrite the CSS hero background (main_porsche.jpg)
  const heroLocal = mapping['brand_assets/general/main_porsche.jpg'];
  if (heroLocal) {
    html = html.replace(
      /url\('brand_assets\/general\/main_porsche\.jpg'\)/g,
      `url('${heroLocal}')`
    );
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`\nRewrote ${replaced} image references in index.html`);

  // Also patch the CSS file for the hero background
  const cssPath = path.join(__dirname, 'styles.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (heroLocal) {
    css = css.replace(
      /url\('brand_assets\/general\/main_porsche\.jpg'\)/g,
      `url('${heroLocal}')`
    );
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Rewrote hero background URL in styles.css');
  }

  console.log('\nDone. All images are now served from Cloudinary CDN.');
  console.log('Transforms applied:', TRANSFORM);
}

main().catch(err => { console.error(err); process.exit(1); });
