'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ==========================================================================
   Panier TPGK.
   Etat local (persiste) qui sert de selection cote vitrine. Le paiement reste
   assure par le tunnel WooCommerce de tpgk.fr — voir lib/woo.ts.
   ========================================================================== */

export type LignePanier = {
  /** Identifiant du produit parent WooCommerce. */
  produitId: number;
  /** Identifiant de la variation choisie, quand la taille en designe une. */
  variationId: number | null;
  slug: string;
  nom: string;
  /** Centimes, fige au moment de l'ajout. */
  prix: number;
  taille: string | null;
  image: string | null;
  quantite: number;
};

/** Deux lignes fusionnent si elles designent le meme article ET la meme taille. */
function memeLigne(a: LignePanier, b: Pick<LignePanier, 'produitId' | 'taille'>) {
  return a.produitId === b.produitId && a.taille === b.taille;
}

type EtatPanier = {
  lignes: LignePanier[];
  ouvert: boolean;

  ajouter: (ligne: Omit<LignePanier, 'quantite'>, quantite?: number) => void;
  retirer: (produitId: number, taille: string | null) => void;
  changerQuantite: (produitId: number, taille: string | null, quantite: number) => void;
  vider: () => void;

  ouvrir: () => void;
  fermer: () => void;
  basculer: () => void;
};

export const usePanier = create<EtatPanier>()(
  persist(
    (set) => ({
      lignes: [],
      ouvert: false,

      ajouter: (ligne, quantite = 1) =>
        set((etat) => {
          const index = etat.lignes.findIndex((l) => memeLigne(l, ligne));
          if (index === -1) {
            return { lignes: [...etat.lignes, { ...ligne, quantite }], ouvert: true };
          }
          const lignes = [...etat.lignes];
          lignes[index] = {
            ...lignes[index],
            quantite: lignes[index].quantite + quantite,
          };
          return { lignes, ouvert: true };
        }),

      retirer: (produitId, taille) =>
        set((etat) => ({
          lignes: etat.lignes.filter((l) => !memeLigne(l, { produitId, taille })),
        })),

      changerQuantite: (produitId, taille, quantite) =>
        set((etat) => {
          if (quantite < 1) {
            return {
              lignes: etat.lignes.filter((l) => !memeLigne(l, { produitId, taille })),
            };
          }
          return {
            lignes: etat.lignes.map((l) =>
              memeLigne(l, { produitId, taille }) ? { ...l, quantite } : l
            ),
          };
        }),

      vider: () => set({ lignes: [] }),

      ouvrir: () => set({ ouvert: true }),
      fermer: () => set({ ouvert: false }),
      basculer: () => set((etat) => ({ ouvert: !etat.ouvert })),
    }),
    {
      name: 'tpgk-panier',
      // L'ouverture du tiroir ne doit pas survivre a un rechargement.
      partialize: (etat) => ({ lignes: etat.lignes }),
    }
  )
);

/* ------------------------------------------------------------- selecteurs */

export const compterArticles = (lignes: LignePanier[]) =>
  lignes.reduce((n, l) => n + l.quantite, 0);

export const totalPanier = (lignes: LignePanier[]) =>
  lignes.reduce((n, l) => n + l.prix * l.quantite, 0);
