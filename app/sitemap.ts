import type { MetadataRoute } from 'next';

import { produits, categoriesNav, metaCatalogue } from '@/lib/catalogue';

/**
 * Plan du site.
 *
 * Genere a partir du catalogue reel : 154 fiches, les collections servies et
 * les pages de service. Sans lui, les moteurs doivent decouvrir les fiches en
 * suivant les liens, ce qui laisse toujours des pages de cote.
 *
 * NOTE : tant que `robots: noindex` est actif dans le layout (preversion), ce
 * plan ne sera pas exploite. Il prend effet le jour de la mise en ligne.
 */
const BASE = process.env.NEXT_PUBLIC_URL_SITE ?? 'https://tpgk.fr';

export default function sitemap(): MetadataRoute.Sitemap {
  const misAJour = new Date(metaCatalogue.genereLe);

  const pagesFixes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: misAJour, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/boutique`, lastModified: misAJour, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/maison`, lastModified: misAJour, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/guide-des-tailles`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/livraison-retours`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/contact`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const collections: MetadataRoute.Sitemap = categoriesNav().map((c) => ({
    url: `${BASE}/collection/${c.slug}`,
    lastModified: misAJour,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const fiches: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${BASE}/produit/${p.slug}`,
    lastModified: misAJour,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...pagesFixes, ...collections, ...fiches];
}
