'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ==========================================================================
   Consentement aux traceurs.

   Le choix du visiteur est reellement conserve et reellement respecte : tant
   qu'il n'a pas accepte, `mesureAutorisee` reste faux et aucun traceur ne doit
   etre charge. Un bandeau qui enregistre un refus puis depose les cookies
   quand meme est une infraction, pas un detail d'implementation.

   Aucun traceur n'est installe a ce jour sur le site. Le jour ou une mesure
   d'audience sera ajoutee, son chargement devra etre conditionne a
   `usePreferences.getState().mesureAutorisee`.
   ========================================================================== */

export type Choix = 'inconnu' | 'accepte' | 'refuse';

type EtatPreferences = {
  choix: Choix;
  /** Date ISO du choix, pour pouvoir le redemander apres expiration. */
  decideLe: string | null;

  accepter: () => void;
  refuser: () => void;
};

export const usePreferences = create<EtatPreferences>()(
  persist(
    (set) => ({
      choix: 'inconnu',
      decideLe: null,

      accepter: () => set({ choix: 'accepte', decideLe: new Date().toISOString() }),
      refuser: () => set({ choix: 'refuse', decideLe: new Date().toISOString() }),
    }),
    { name: 'tpgk-preferences' }
  )
);

/**
 * Vrai uniquement si le visiteur a explicitement accepte.
 * L'absence de choix vaut refus — c'est ce qu'exige le consentement prealable.
 */
export function mesureAutorisee(): boolean {
  return usePreferences.getState().choix === 'accepte';
}
