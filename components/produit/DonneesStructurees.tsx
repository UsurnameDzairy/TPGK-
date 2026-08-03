import type { Produit } from '@/lib/catalogue';

const BASE = process.env.NEXT_PUBLIC_URL_SITE ?? 'https://tpgk.fr';

/**
 * Donnees structurees Schema.org pour une fiche produit.
 *
 * C'est ce qui permet a Google d'afficher le prix, la disponibilite et la
 * marque directement dans les resultats de recherche. Sur une boutique, le
 * gain est bien plus net que n'importe quel ajustement d'URL.
 *
 * Aucune valeur n'est inventee : le prix et le stock viennent du catalogue
 * WooCommerce. On n'annonce pas d'avis clients ni de note, faute d'en avoir.
 * Declarer des avis inexistants expose a une penalite manuelle de Google.
 */
export default function DonneesStructurees({ produit }: { produit: Produit }) {
  const donnees = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: produit.nom,
    description: produit.resume || produit.description.slice(0, 300),
    image: produit.images.map((i) => `${BASE}${i.src}`),
    sku: produit.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'TPGK' },
    offers: {
      '@type': 'Offer',
      url: `${BASE}/produit/${produit.slug}`,
      priceCurrency: 'EUR',
      price: (produit.prix / 100).toFixed(2),
      availability: produit.enStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'TPGK' },
    },
    ...(produit.tailles.length > 0 && {
      size: produit.tailles.map((t) => t.label),
    }),
  };

  return (
    <script
      type="application/ld+json"
      // Contenu genere par nous a partir du catalogue, jamais d'entree visiteur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
    />
  );
}
