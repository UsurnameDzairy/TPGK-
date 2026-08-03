/**
 * Import du catalogue TPGK depuis l'API Store WooCommerce de tpgk.fr.
 *
 * Produit deux choses :
 *   - data/catalogue.json  : produits + categories normalises
 *   - public/media/products/*.webp : toutes les images, en local (aucun hotlink)
 *
 * Le script est idempotent : une image deja presente n'est pas retelechargee.
 * Toute erreur est collectee et affichee en fin de course ; le script sort en
 * code 1 si une image a echoue, pour qu'un import partiel ne passe jamais pour
 * un import reussi.
 */

import { mkdir, writeFile, access, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://tpgk.fr/wp-json/wc/store/v1';
const MEDIA_DIR = join(ROOT, 'public/media/products');
const DATA_DIR = join(ROOT, 'data');

/**
 * Largeur max stockee : c'est exactement la taille des originaux WordPress
 * (1440x2560). Descendre en dessous perdait de la definition pour rien.
 * La qualite est volontairement haute — next/image recompresse ensuite pour
 * chaque taille servie, et deux compressions successives se voient.
 */
const IMAGE_WIDTH = 1440;
const IMAGE_QUALITY = 92;
const CONCURRENCY = 8;

const errors = [];

/* ------------------------------------------------------------------ utils */

const HTML_ENTITIES = {
  '&amp;': '&', '&#038;': '&', '&quot;': '"', '&#34;': '"', '&#039;': "'",
  '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ',
  '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à', '&ccedil;': 'ç',
  '&#8211;': '–', '&#8212;': '—', '&#8217;': '’', '&hellip;': '…',
};

function decodeEntities(input = '') {
  return input
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m] ?? m)
    .trim();
}

/** Retire le balisage tout en gardant les sauts de paragraphe. */
function htmlToText(html = '') {
  return decodeEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\/\s*p\s*>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(input = '') {
  return decodeEntities(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'TPGK-import/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`${url} -> ${err.message}`);
  }
}

/** Execute `worker` sur chaque item, `limit` en parallele au maximum. */
async function pool(items, limit, worker) {
  const queue = [...items.entries()];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const [index, item] = queue.shift();
      await worker(item, index);
    }
  });
  await Promise.all(runners);
}

/* ----------------------------------------------------------------- images */

/**
 * Les images passent par Jetpack Photon (i0.wp.com). On lui demande
 * directement la largeur voulue plutot que de tirer un original de 2560px.
 */
function sourceUrl(src) {
  try {
    const url = new URL(src);
    if (url.hostname.endsWith('wp.com')) {
      url.searchParams.delete('fit');
      url.searchParams.delete('resize');
      url.searchParams.set('w', String(IMAGE_WIDTH));
      url.searchParams.set('ssl', '1');
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}

async function downloadImage(src, filename) {
  const target = join(MEDIA_DIR, filename);

  if (await exists(target)) {
    const info = await stat(target);
    if (info.size > 1024) return { filename, skipped: true };
  }

  const res = await fetch(sourceUrl(src), { headers: { 'User-Agent': 'TPGK-import/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${src}`);

  const input = Buffer.from(await res.arrayBuffer());
  const image = sharp(input).rotate();
  const meta = await image.metadata();

  await image
    .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: IMAGE_QUALITY, effort: 6 })
    .toFile(target);

  const out = await sharp(target).metadata();
  return { filename, width: out.width, height: out.height, sourceWidth: meta.width };
}

/* --------------------------------------------------------------- produits */

function normaliseTailles(attributes = []) {
  const bucket = new Map();
  for (const attr of attributes) {
    if (!attr?.terms?.length) continue;
    const isSize = /taille|pointure/i.test(attr.name ?? '');
    if (!isSize) continue;
    for (const term of attr.terms) {
      const label = decodeEntities(term.name);
      if (label && !bucket.has(label)) {
        bucket.set(label, { label, slug: term.slug, id: term.id });
      }
    }
  }
  const ordre = ['XS', 'XS/S', 'S', 'S/M', 'M', 'M/L', 'L', 'L/XL', 'XL', 'XL/XXL', 'XXL', 'TU'];
  return [...bucket.values()].sort((a, b) => {
    const ia = ordre.indexOf(a.label.toUpperCase());
    const ib = ordre.indexOf(b.label.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    // pointures : tri numerique
    const na = parseFloat(a.label);
    const nb = parseFloat(b.label);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.label.localeCompare(b.label, 'fr');
  });
}

async function normaliseProduit(raw) {
  const slug = raw.slug || slugify(raw.name);
  const images = [];

  for (const [index, img] of (raw.images ?? []).entries()) {
    const filename = `${slug}-${index + 1}.webp`;
    try {
      const meta = await downloadImage(img.src, filename);
      images.push({
        src: `/media/products/${filename}`,
        width: meta.width ?? IMAGE_WIDTH,
        height: meta.height ?? Math.round(IMAGE_WIDTH * 16 / 9),
        alt: decodeEntities(img.alt) || decodeEntities(raw.name),
      });
    } catch (err) {
      errors.push(`image ${filename} : ${err.message}`);
    }
  }

  const prix = Number(raw.prices?.price ?? 0);
  const prixRef = Number(raw.prices?.regular_price ?? prix);

  return {
    id: raw.id,
    slug,
    nom: decodeEntities(raw.name),
    sku: raw.sku || null,
    prix,                                   // centimes
    prixReference: prixRef,
    enPromo: Boolean(raw.on_sale) && prixRef > prix,
    enStock: raw.is_in_stock !== false,
    resume: htmlToText(raw.short_description),
    description: htmlToText(raw.description),
    images,
    tailles: normaliseTailles(raw.attributes),
    categories: (raw.categories ?? []).map((c) => ({
      nom: decodeEntities(c.name),
      slug: c.slug,
    })),
    // Sortie vers le tunnel WooCommerce existant : c'est lui qui encaisse.
    urlBoutique: raw.permalink,
    variations: (raw.variations ?? []).map((v) => ({
      id: v.id,
      attributs: (v.attributes ?? []).map((a) => a.value),
    })),
  };
}

/* ------------------------------------------------------------------- main */

async function main() {
  console.log('→ Import du catalogue TPGK\n');
  await mkdir(MEDIA_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  console.log('  Categories…');
  const catsRaw = await fetchJson(`${API}/products/categories?per_page=100`);
  const categories = catsRaw
    .filter((c) => c.count > 0)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      nom: decodeEntities(c.name),
      nombre: c.count,
      parent: c.parent || null,
    }));
  console.log(`  ${categories.length} categories\n`);

  console.log('  Produits…');
  const pages = [1, 2];
  const bruts = [];
  for (const page of pages) {
    const lot = await fetchJson(`${API}/products?per_page=100&page=${page}`);
    if (Array.isArray(lot)) bruts.push(...lot);
  }
  console.log(`  ${bruts.length} produits\n`);

  console.log('  Images (telechargement + conversion WebP)…');
  const produits = new Array(bruts.length);
  let fait = 0;
  await pool(bruts, CONCURRENCY, async (raw, index) => {
    produits[index] = await normaliseProduit(raw);
    fait += 1;
    if (fait % 20 === 0 || fait === bruts.length) {
      process.stdout.write(`    ${fait}/${bruts.length} produits traites\n`);
    }
  });

  const catalogue = {
    genereLe: new Date().toISOString(),
    source: 'https://tpgk.fr (API Store WooCommerce)',
    devise: 'EUR',
    categories,
    produits: produits.filter(Boolean),
  };

  await writeFile(
    join(DATA_DIR, 'catalogue.json'),
    JSON.stringify(catalogue, null, 2),
    'utf8'
  );

  const fichiers = await readdir(MEDIA_DIR);
  const totalImages = catalogue.produits.reduce((n, p) => n + p.images.length, 0);

  console.log('\n──────────────────────────────────────────');
  console.log(`  Produits ecrits   : ${catalogue.produits.length}`);
  console.log(`  Images referencees: ${totalImages}`);
  console.log(`  Fichiers sur disque: ${fichiers.length}`);
  console.log(`  Sans image        : ${catalogue.produits.filter((p) => !p.images.length).length}`);
  console.log('──────────────────────────────────────────');

  if (errors.length) {
    console.error(`\n✗ ${errors.length} erreur(s) :`);
    for (const e of errors.slice(0, 30)) console.error('   -', e);
    if (errors.length > 30) console.error(`   … et ${errors.length - 30} autres`);
    process.exitCode = 1;
    return;
  }
  console.log('\n✓ Import termine sans erreur.');
}

main().catch((err) => {
  console.error('\n✗ Import interrompu :', err.message);
  process.exit(1);
});
