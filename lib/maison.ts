/* ==========================================================================
   L'histoire de la maison TPGK.

   Chaque fait provient de la page « Qui sommes-nous ? » de tpgk.fr
   (/nos-boutiques/), consultee le 2 aout 2026 :

     « TPGK est une enseigne francaise de pret-a-porter feminin existant
       depuis pres de 10 ans. Vous trouverez nos deux boutiques physiques
       sur la cote d'Azur a Cannes et Antibes – Juan les pins.
       Notre philosophie est de vous faire decouvrir les articles les plus
       tendances pour vos looks quotidien. Nous nous efforcons de vous
       proposer les meilleures qualites aux prix les plus justes. »

   Rien n'est ajoute a ce socle. Les formulations sont retravaillees pour la
   mise en page, les faits ne le sont pas.
   ========================================================================== */

export const MAISON = {
  nature: 'Enseigne francaise de pret-a-porter feminin',

  /** La page indiquait « pres de 10 ans » ; elle date de 2022. */
  anciennete: 'Plus de dix ans',

  philosophie:
    'Faire decouvrir les pieces les plus actuelles pour le vestiaire de tous les jours, en cherchant la meilleure qualite au prix le plus juste.',

  territoire: 'Cote d’Azur',
} as const;

export type Boutique = {
  ville: string;
  precision?: string;
};

/**
 * Les trois adresses physiques de la maison.
 *
 * ATTENTION a la source : la page « Qui sommes-nous ? » de tpgk.fr n'en cite
 * que deux (Cannes et Antibes – Juan-les-Pins). La boutique de **Nice** a ete
 * communiquee directement par la maison le 2 aout 2026 ; elle ne figure
 * nulle part sur le site actuel, qui est donc en retard sur la realite.
 *
 * A signaler a l'equipe : la page d'origine reste a mettre a jour.
 */
export const BOUTIQUES: Boutique[] = [
  { ville: 'Cannes' },
  { ville: 'Antibes', precision: 'Juan-les-Pins' },
  { ville: 'Nice' },
];

/**
 * Reperes chiffres affiches en bandeau.
 * `valeur` doit rester verifiable : les compteurs de produits sont calcules
 * a partir du catalogue reel par la page qui les affiche.
 */
export const REPERES = [
  { valeur: MAISON.anciennete, intitule: 'D’existence' },
  { valeur: '3', intitule: 'Boutiques sur la Cote d’Azur' },
  { valeur: 'France', intitule: 'Stock et expedition' },
] as const;
