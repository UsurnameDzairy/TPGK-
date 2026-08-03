/* ==========================================================================
   Informations commerciales TPGK.

   Reprises telles quelles des pages officielles de tpgk.fr
   (/livraison-retour/ et /paiement/), consultees le 2 aout 2026.
   Rien n'est invente ici : si une information manque cote boutique, elle
   est absente de ce fichier plutot que comblee.
   ========================================================================== */

export const SEUIL_FRANCO = 5000; // centimes

export type ModeLivraison = {
  nom: string;
  delai: string;
  prix: string;
  prixFranco: string;
};

/** Tarifs officiels, seuil de gratuite a 50 €. */
export const LIVRAISONS: ModeLivraison[] = [
  {
    nom: 'Mondial Relay',
    delai: 'Point relais, 3 a 5 jours',
    prix: '5,00 EUR',
    prixFranco: 'Offert',
  },
  {
    nom: 'Colissimo',
    delai: 'A domicile, sous 48 h',
    prix: '8,00 EUR',
    prixFranco: '5,00 EUR',
  },
  {
    nom: 'Chronopost',
    delai: 'A domicile, sous 24 h',
    prix: '12,00 EUR',
    prixFranco: '12,00 EUR',
  },
];

export const EXPEDITION =
  'Commande deposee chez le transporteur sous 48 h ouvrees maximum.';

/**
 * Le retrait en magasin figure sur tpgk.fr avec la mention « pas disponible
 * pour le moment ». On le garde visible et explicitement indisponible plutot
 * que de le masquer : c'est une information utile au visiteur.
 */
export const RETRAIT_MAGASIN = {
  disponible: false,
  mention: 'Retrait en magasin — indisponible pour le moment',
};

export const PAIEMENTS = [
  'PayPal',
  'Carte bancaire — Visa, Mastercard, American Express',
];

export const SECURITE_PAIEMENT =
  'Paiements par carte geres par la Caisse d’Epargne. Les coordonnees bancaires ne sont pas conservees par la boutique.';

/**
 * Correspondances de tailles.
 *
 * ATTENTION : ces equivalences ne proviennent PAS de TPGK. La page
 * « guide des tailles » de tpgk.fr est inexploitable — shortcodes WPBakery
 * non interpretes, et elle renvoie a une autre marque (« AZZOS »).
 *
 * Les valeurs ci-dessous sont la convention francaise usuelle du pret-a-porter
 * (XS=34, S=36, M=38, L=40, XL=42). Elles sont fournies a titre indicatif et
 * l'interface DOIT l'annoncer via `AVERTISSEMENT_TAILLES`. Aucune mensuration
 * en centimetres n'est donnee : TPGK n'en publie aucune, et les inventer
 * induirait le client en erreur au moment ou il choisit sa taille.
 *
 * A remplacer des que la maison fournit son propre tableau.
 */
export const CORRESPONDANCES_VETEMENTS = [
  { groupe: 'XS/S', equivaut: '34 — 36' },
  { groupe: 'S/M', equivaut: '36 — 38' },
  { groupe: 'M/L', equivaut: '38 — 40' },
  { groupe: 'L/XL', equivaut: '40 — 42' },
  { groupe: 'XL/XXL', equivaut: '42 — 44' },
];

export const AVERTISSEMENT_TAILLES =
  'Correspondances indicatives, etablies selon les tailles francaises usuelles du pret-a-porter. Elles ne constituent pas un bareme officiel TPGK.';

export const NOTE_TAILLES =
  'Les pieces TPGK sont proposees en tailles groupees. En cas d’hesitation entre deux groupes, privilegiez le plus grand pour les matieres peu extensibles (dentelle, tailleur) et le plus petit pour les mailles.';

export const CONTACT = {
  page: 'https://tpgk.fr/contact/',
  mentionStock: 'Stock en France',
};
