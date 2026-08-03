'use client';

import { useEffect, useRef } from 'react';
import { gsap, mouvementReduit } from '@/lib/animation';

const ANNONCES = [
  'Stock en France',
  'Mondial Relay offert des 50 EUR',
  'Trois boutiques sur la Cote d’Azur',
];

/**
 * Bandeau d'annonce en tete de page.
 *
 * La ligne defile en continu et sans a-coup : la suite de messages est
 * dupliquee, et la translation revient a zero une fois la premiere copie
 * sortie du cadre. En mouvement reduit, le bandeau reste fixe et lisible.
 */
export default function BandeauAnnonce() {
  const pisteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const piste = pisteRef.current;
    if (!piste || mouvementReduit()) return;

    const ctx = gsap.context(() => {
      const largeur = piste.scrollWidth / 2;
      if (largeur <= 0) return;

      gsap.to(piste, {
        x: -largeur,
        duration: Math.max(22, largeur / 26),
        ease: 'none',
        repeat: -1,
        modifiers: { x: (v) => `${parseFloat(v) % largeur}px` },
      });
    }, piste);

    return () => ctx.revert();
  }, []);

  const suite = [...ANNONCES, ...ANNONCES, ...ANNONCES, ...ANNONCES];

  return (
    <div className="relative z-[100] overflow-hidden border-b border-filet bg-blanc py-2">
      <div ref={pisteRef} className="flex w-max items-center gap-14">
        {suite.map((texte, i) => (
          <span key={`${texte}-${i}`} className="flex items-center gap-14">
            <span className="label-xs whitespace-nowrap text-encre">{texte}</span>
            <span aria-hidden className="block h-[3px] w-[3px] rounded-full bg-rose" />
          </span>
        ))}
      </div>
    </div>
  );
}
