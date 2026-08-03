/* ==========================================================================
   Internationalisation.

   Deux langues servies sous des prefixes distincts (/fr, /en), chacune avec
   ses propres segments d'URL. C'est la structure attendue par les moteurs :
   une URL par langue, declaree via `hreflang`, plutot qu'une seule URL dont
   le contenu change — ce dernier cas empeche l'indexation des deux versions.

   Le francais reste la langue de reference : l'audience est francaise, la
   boutique livre en France et les trois adresses sont sur la Cote d'Azur.
   ========================================================================== */

export const LANGUES = ['fr', 'en'] as const;
export type Langue = (typeof LANGUES)[number];

export const LANGUE_PAR_DEFAUT: Langue = 'fr';

/** Code complet, pour l'attribut `lang` et les balises `hreflang`. */
export const CODES_COMPLETS: Record<Langue, string> = {
  fr: 'fr-FR',
  en: 'en',
};

/**
 * Segments d'URL par langue.
 *
 * Les mots de l'URL comptent pour le referencement : une visiteuse
 * francophone cherche « robe », une anglophone « dress ». Traduire les
 * segments est le seul interet reel d'avoir des URL differentes.
 */
export const SEGMENTS = {
  boutique: { fr: 'boutique', en: 'shop' },
  collection: { fr: 'collection', en: 'collection' },
  produit: { fr: 'produit', en: 'product' },
  maison: { fr: 'maison', en: 'about' },
  contact: { fr: 'contact', en: 'contact' },
  tailles: { fr: 'guide-des-tailles', en: 'size-guide' },
  livraison: { fr: 'livraison-retours', en: 'shipping-returns' },
} as const;

export type CleSegment = keyof typeof SEGMENTS;

/** Construit un chemin absolu dans la langue voulue. */
export function chemin(langue: Langue, cle?: CleSegment, suite?: string): string {
  if (!cle) return `/${langue}`;
  const segment = SEGMENTS[cle][langue];
  return suite ? `/${langue}/${segment}/${suite}` : `/${langue}/${segment}`;
}

/* ------------------------------------------------------------ traductions */

export const TEXTES = {
  fr: {
    nav: {
      menu: 'Menu',
      fermer: 'Fermer',
      boutique: 'Boutique',
      maison: 'La maison',
      panier: 'Panier',
      collections: 'Collections',
      pays: 'France (EUR)',
      allerContenu: 'Aller au contenu',
    },
    annonces: [
      'Stock en France',
      'Mondial Relay offert des 50 EUR',
      'Trois boutiques sur la Cote d’Azur',
    ],
    accueil: {
      decouvrir: 'Decouvrir la collection',
      nouveautes: 'Nouveautes',
      voirNouveautes: 'Voir les nouveautes',
      meilleuresVentes: 'Meilleures ventes',
      voirBoutique: 'Voir toute la boutique',
      vestiaire: 'Vestiaire d’hiver',
      traversent: 'Des pieces qui traversent les saisons',
      manteaux: 'Manteaux & vestes',
      lookbook: 'Le vestiaire en images',
      nosBoutiques: 'Nos boutiques',
      troisAdresses: 'Trois adresses sur la Cote d’Azur',
      adressesDetail:
        'Adresses detaillees et horaires disponibles aupres de la boutique.',
      nousContacter: 'Nous contacter',
      toutesCollections: 'Toutes les collections',
      manifesteTitre: 'L’elegance au quotidien avec TPGK',
    },
    boutique: {
      titre: 'Toutes les pieces',
      chapeau: 'La selection complete de la maison, robes et tailleurs en tete.',
      filtrer: 'Filtrer et trier',
      piece: 'piece',
      pieces: 'pieces',
      taille: 'Taille',
      toutes: 'Toutes',
      trier: 'Trier les pieces',
      aucune: 'Aucune piece ne correspond a ce filtre.',
      tris: {
        nouveaute: 'Nouveautes',
        alpha: 'Alphabetique, A–Z',
        prixCroissant: 'Prix croissant',
        prixDecroissant: 'Prix decroissant',
      },
    },
    produit: {
      ajouter: 'Ajouter au panier',
      ajoute: 'Ajoute au panier',
      epuise: 'Piece epuisee',
      choisirTaille: 'Choisissez une taille pour continuer.',
      guideTailles: 'Guide des tailles',
      description: 'Description',
      livraisonRetours: 'Livraison & retours',
      paiement: 'Paiement',
      reference: 'Reference',
      voirSurBoutique: 'Voir cette piece sur tpgk.fr',
      aDecouvrir: 'A decouvrir aussi',
      remise: 'Remise',
      agrandir: 'Agrandir',
    },
    panier: {
      titre: 'Panier',
      vide: 'Votre panier est vide',
      parcourir: 'Parcourir la boutique',
      total: 'Total',
      commander: 'Commander',
      transfert: 'Transfert en cours…',
      securise: 'Paiement securise sur tpgk.fr',
      echec: 'Transfert vers la boutique impossible',
      parArticle: 'Commander article par article :',
    },
    pied: {
      collections: 'Collections',
      aide: 'Aide',
      maison: 'La maison',
      newsletter: 'Newsletter',
      nousEcrire: 'Nous ecrire',
      droits: 'Tous droits reserves',
    },
  },

  en: {
    nav: {
      menu: 'Menu',
      fermer: 'Close',
      boutique: 'Shop',
      maison: 'About',
      panier: 'Cart',
      collections: 'Collections',
      pays: 'France (EUR)',
      allerContenu: 'Skip to content',
    },
    annonces: [
      'Stocked in France',
      'Free Mondial Relay shipping over EUR 50',
      'Three boutiques on the French Riviera',
    ],
    accueil: {
      decouvrir: 'Discover the collection',
      nouveautes: 'New in',
      voirNouveautes: 'See what’s new',
      meilleuresVentes: 'Best sellers',
      voirBoutique: 'Browse the whole shop',
      vestiaire: 'Winter wardrobe',
      traversent: 'Pieces that outlast the season',
      manteaux: 'Coats & jackets',
      lookbook: 'The wardrobe in pictures',
      nosBoutiques: 'Our boutiques',
      troisAdresses: 'Three addresses on the French Riviera',
      adressesDetail:
        'Full addresses and opening hours available from the boutique.',
      nousContacter: 'Contact us',
      toutesCollections: 'All collections',
      manifesteTitre: 'Everyday elegance with TPGK',
    },
    boutique: {
      titre: 'All pieces',
      chapeau: 'The house’s full selection, led by dresses and tailoring.',
      filtrer: 'Filter and sort',
      piece: 'piece',
      pieces: 'pieces',
      taille: 'Size',
      toutes: 'All',
      trier: 'Sort pieces',
      aucune: 'No piece matches this filter.',
      tris: {
        nouveaute: 'Newest',
        alpha: 'Alphabetically, A–Z',
        prixCroissant: 'Price, low to high',
        prixDecroissant: 'Price, high to low',
      },
    },
    produit: {
      ajouter: 'Add to cart',
      ajoute: 'Added to cart',
      epuise: 'Sold out',
      choisirTaille: 'Please choose a size to continue.',
      guideTailles: 'Size guide',
      description: 'Description',
      livraisonRetours: 'Shipping & returns',
      paiement: 'Payment',
      reference: 'Reference',
      voirSurBoutique: 'View this piece on tpgk.fr',
      aDecouvrir: 'You may also like',
      remise: 'Sale',
      agrandir: 'Enlarge',
    },
    panier: {
      titre: 'Cart',
      vide: 'Your cart is empty',
      parcourir: 'Browse the shop',
      total: 'Total',
      commander: 'Checkout',
      transfert: 'Transferring…',
      securise: 'Secure payment on tpgk.fr',
      echec: 'Could not transfer to the shop',
      parArticle: 'Order item by item:',
    },
    pied: {
      collections: 'Collections',
      aide: 'Help',
      maison: 'The house',
      newsletter: 'Newsletter',
      nousEcrire: 'Write to us',
      droits: 'All rights reserved',
    },
  },
} as const;

export type Textes = (typeof TEXTES)['fr'];

export function textes(langue: Langue): Textes {
  return TEXTES[langue] as Textes;
}

/** Vrai si la valeur correspond a une langue servie. */
export function estLangue(valeur: string): valeur is Langue {
  return (LANGUES as readonly string[]).includes(valeur);
}
