import catalogueBrut from '@/data/catalogue.json';

/* ==========================================================================
   Acces au catalogue TPGK.
   Source : data/catalogue.json, genere par scripts/import-catalogue.mjs
   depuis l'API Store WooCommerce de tpgk.fr. Aucune donnee inventee ici.
   ========================================================================== */

export type Image = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Taille = {
  label: string;
  slug: string;
  id: number;
};

export type CategorieRef = {
  nom: string;
  slug: string;
};

export type Produit = {
  id: number;
  slug: string;
  nom: string;
  sku: string | null;
  /** Centimes. */
  prix: number;
  prixReference: number;
  enPromo: boolean;
  enStock: boolean;
  resume: string;
  description: string;
  images: Image[];
  tailles: Taille[];
  categories: CategorieRef[];
  /** Fiche WooCommerce d'origine — c'est elle qui encaisse le paiement. */
  urlBoutique: string;
  variations: { id: number; attributs: string[] }[];
};

export type Categorie = {
  id: number;
  slug: string;
  nom: string;
  nombre: number;
  parent: number | null;
  /** Premiere image d'un produit de la categorie, pour les apercus de menu. */
  apercu?: string | null;
};

type Catalogue = {
  genereLe: string;
  source: string;
  devise: string;
  categories: Categorie[];
  produits: Produit[];
};

const catalogue = catalogueBrut as Catalogue;

/* --------------------------------------------------------------- filtrage */

/**
 * Le catalogue source contient quelques fiches inexploitables en boutique :
 * cinq produits sans aucune image et un produit a 0,00 €. Elles existent
 * telles quelles sur tpgk.fr. On les ecarte de la vitrine plutot que
 * d'afficher une carte vide ou un prix a zero, mais de facon explicite —
 * `produitsEcartes` permet de les auditer a tout moment.
 */
function estVendable(p: Produit): boolean {
  return p.images.length > 0 && p.prix > 0;
}

export const produitsEcartes: Produit[] = catalogue.produits.filter(
  (p) => !estVendable(p)
);

export const produits: Produit[] = catalogue.produits.filter(estVendable);

export const categories: Categorie[] = catalogue.categories;

/* ------------------------------------------------------------- selecteurs */

export function produitParSlug(slug: string): Produit | undefined {
  return produits.find((p) => p.slug === slug);
}

export function categorieParSlug(slug: string): Categorie | undefined {
  return categories.find((c) => c.slug === slug);
}

export function produitsDeCategorie(slug: string): Produit[] {
  return produits.filter((p) => p.categories.some((c) => c.slug === slug));
}

/** Catégories mises en avant dans la navigation, dans l'ordre du site actuel. */
const ORDRE_NAV = [
  'nouveautes',
  'meilleures-ventes',
  'robes',
  'tailleurs-femme',
  'manteaux-veste',
  'haut',
  'jupe',
  'pantalons-femme',
  'ensemble',
  'chaussures',
  'talons',
  'bottes',
  'sandales',
  'baskets',
];

export function categoriesNav(): Categorie[] {
  // Une piece ne doit jamais illustrer deux collections : les categories se
  // chevauchent largement (une meme robe est a la fois « Nouveautes » et
  // « Robes »). On reserve donc le PRODUIT entier, et pas seulement la photo :
  // deux cliches differents du meme vetement se lisent aussi comme un doublon.
  const produitsPris = new Set<number>();

  const choisirApercu = (slug: string): string | null => {
    const lot = produitsDeCategorie(slug);
    const libre = lot.find((p) => !produitsPris.has(p.id) && p.images.length > 0);
    if (libre) {
      produitsPris.add(libre.id);
      return libre.images[0].src;
    }
    // Catalogue entierement deja pioche : mieux vaut repeter que ne rien montrer.
    return lot[0]?.images[0]?.src ?? null;
  };

  return ORDRE_NAV.map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Categorie => Boolean(c) && (c as Categorie).nombre > 0)
    .map((c) => ({
      ...c,
      // Le comptage WooCommerce inclut les fiches sans image ; on recompte
      // sur les produits reellement affichables pour ne pas annoncer faux.
      nombre: produitsDeCategorie(c.slug).length,
      apercu: choisirApercu(c.slug),
    }))
    .filter((c) => c.nombre > 0);
}

/**
 * Recommandations : meme categorie en priorite, complete si necessaire pour
 * toujours renvoyer `limite` articles tant que le catalogue le permet.
 */
export function produitsSimilaires(produit: Produit, limite = 4): Produit[] {
  const slugsCategorie = new Set(
    produit.categories.map((c) => c.slug).filter((s) => s !== 'vetement')
  );

  const memeCategorie = produits.filter(
    (p) =>
      p.id !== produit.id &&
      p.categories.some((c) => slugsCategorie.has(c.slug))
  );

  if (memeCategorie.length >= limite) return memeCategorie.slice(0, limite);

  const complement = produits.filter(
    (p) => p.id !== produit.id && !memeCategorie.includes(p)
  );
  return [...memeCategorie, ...complement].slice(0, limite);
}

/* ------------------------------------------------------ projection legere */

/**
 * Version reduite d'un produit, destinee aux grilles rendues cote client.
 * Les descriptions completes representent l'essentiel du poids du catalogue
 * et ne servent a rien dans une carte : on ne les transmet pas au navigateur.
 */
export type ProduitCarte = Pick<
  Produit,
  'id' | 'slug' | 'nom' | 'prix' | 'prixReference' | 'enPromo' | 'enStock' | 'tailles'
> & {
  images: Image[];
  categories: CategorieRef[];
};

export function versCarte(p: Produit): ProduitCarte {
  return {
    id: p.id,
    slug: p.slug,
    nom: p.nom,
    prix: p.prix,
    prixReference: p.prixReference,
    enPromo: p.enPromo,
    enStock: p.enStock,
    tailles: p.tailles,
    // Deux visuels suffisent : l'image au repos et celle du volet.
    images: p.images.slice(0, 2),
    categories: p.categories,
  };
}

/* ---------------------------------------------------------------- formats */

// Les formateurs vivent dans lib/format.ts : ce module-ci embarque le JSON
// du catalogue et ne doit jamais etre importe par un composant client.
export { formaterPrix, prixAccessible } from './format';

export const metaCatalogue = {
  genereLe: catalogue.genereLe,
  source: catalogue.source,
  total: produits.length,
};
