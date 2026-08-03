'use client';

import type { LignePanier } from './panier';

/* ==========================================================================
   Passerelle vers le WooCommerce de tpgk.fr.

   Le catalogue est lu depuis un export local, mais l'encaissement reste
   assure par la boutique WooCommerce existante. Cette couche transfere la
   selection du visiteur dans un vrai panier WooCommerce via la Store API,
   puis renvoie l'URL de sortie.

   Sequence, verifiee sur tpgk.fr :
     GET  /cart            -> en-tetes `Nonce` et `Cart-Token`
     POST /cart/add-item   -> 201, avec ces deux en-tetes
   Sans l'en-tete `Nonce`, l'API repond 401.

   LIMITE CONNUE : la reprise du panier au moment de payer repose sur le
   cookie de session WooCommerce. Elle est fiable si la vitrine est servie
   depuis tpgk.fr ou l'un de ses sous-domaines. Depuis un domaine tiers, les
   navigateurs bloquent les cookies inter-sites : la synchronisation peut
   echouer. Dans ce cas la fonction le signale — jamais de faux succes.
   ========================================================================== */

export const BOUTIQUE = 'https://tpgk.fr';
const API = `${BOUTIQUE}/wp-json/wc/store/v1`;

export const URL_PANIER = `${BOUTIQUE}/panier/`;

/** Lien direct vers la fiche WooCommerce, repli toujours valide. */
export function lienProduit(slug: string) {
  return `${BOUTIQUE}/produit/${slug}/`;
}

type Jetons = { nonce: string; cartToken: string };

async function obtenirJetons(): Promise<Jetons> {
  const res = await fetch(`${API}/cart`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  const nonce = res.headers.get('Nonce') ?? res.headers.get('nonce');
  const cartToken = res.headers.get('Cart-Token') ?? res.headers.get('cart-token');

  if (!nonce || !cartToken) {
    throw new Error(
      "La boutique n'a pas fourni de jeton de session (en-tetes Nonce/Cart-Token absents)."
    );
  }
  return { nonce, cartToken };
}

async function ajouterArticle(ligne: LignePanier, jetons: Jetons): Promise<void> {
  const res = await fetch(`${API}/cart/add-item`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Nonce: jetons.nonce,
      'Cart-Token': jetons.cartToken,
    },
    body: JSON.stringify({
      // Une variation designe un article precis : c'est elle qu'on envoie.
      id: ligne.variationId ?? ligne.produitId,
      quantity: ligne.quantite,
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const corps = await res.json();
      if (corps?.message) detail = corps.message;
    } catch {
      /* corps non lisible : on garde le code HTTP */
    }
    throw new Error(`« ${ligne.nom} » n'a pas pu etre ajoute — ${detail}`);
  }
}

export type ResultatTransfert =
  | { ok: true; url: string }
  | { ok: false; erreur: string; replis: { nom: string; url: string }[] };

/**
 * Transfere les lignes vers le panier WooCommerce.
 * En cas d'echec, renvoie l'erreur reelle et des liens de repli vers les
 * fiches produit d'origine, pour que le visiteur puisse toujours commander.
 */
export async function transfererPanier(
  lignes: LignePanier[]
): Promise<ResultatTransfert> {
  if (lignes.length === 0) {
    return { ok: false, erreur: 'Le panier est vide.', replis: [] };
  }

  try {
    const jetons = await obtenirJetons();
    // Sequentiel : WooCommerce serialise de toute facon les ecritures panier.
    for (const ligne of lignes) {
      await ajouterArticle(ligne, jetons);
    }
    return { ok: true, url: URL_PANIER };
  } catch (err) {
    return {
      ok: false,
      erreur:
        err instanceof Error
          ? err.message
          : 'Transfert impossible vers la boutique.',
      replis: lignes.map((l) => ({ nom: l.nom, url: lienProduit(l.slug) })),
    };
  }
}
