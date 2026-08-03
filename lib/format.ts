/* ==========================================================================
   Formatage partage client/serveur.

   Volontairement separe de lib/catalogue.ts : ce dernier importe le JSON du
   catalogue complet, qui n'a rien a faire dans un bundle navigateur.
   ========================================================================== */

const formateurEuro = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Prix en centimes vers l'affichage boutique : « 109,99 € ».
 * Une espace insecable retient le symbole contre le nombre, pour qu'il ne
 * passe jamais seul a la ligne dans une grille serree.
 */
export function formaterPrix(centimes: number): string {
  return `${formateurEuro.format(centimes / 100)} €`;
}

/** Variante lisible a voix haute, pour les lecteurs d'ecran. */
export function prixAccessible(centimes: number): string {
  return `${formateurEuro.format(centimes / 100)} euros`;
}
