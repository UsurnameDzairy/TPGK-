'use client';

import { useRef } from 'react';
import Link from 'next/link';

import CarteProduit from '@/components/produit/CarteProduit';
import { useReveal } from '@/lib/animation';
import type { ProduitCarte } from '@/lib/catalogue';

type Props = {
  titre: string;
  produits: ProduitCarte[];
  lien?: { href: string; nom: string };
};

/**
 * Selection de pieces.
 *
 * Grille bord a bord : les visuels touchent les bords de la fenetre, separes
 * par un filet de blanc seulement. C'est ce cadrage sans marge qui donne aux
 * planches de mode leur densite — une gouttiere autour aurait fait catalogue.
 */
export default function Selection({ titre, produits, lien }: Props) {
  const zoneRef = useRef<HTMLElement>(null);
  useReveal(zoneRef);

  if (produits.length === 0) return null;

  return (
    <section ref={zoneRef} className="py-16 md:py-20">
      <h2
        data-reveal
        className="avant-reveal serif mb-8 text-center text-[clamp(1.1rem,2.2vw,1.5rem)] uppercase tracking-[0.16em] md:mb-10"
      >
        {titre}
      </h2>

      <div className="grid grid-cols-2 gap-x-px gap-y-8 md:grid-cols-4 xl:grid-cols-5">
        {produits.map((p, i) => (
          <div
            key={p.id}
            data-reveal
            data-reveal-delai={(i % 5) * 0.05}
            className="avant-reveal"
          >
            <CarteProduit
              produit={p}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
              bordABord
            />
          </div>
        ))}
      </div>

      {lien && (
        <div className="mt-12 text-center">
          <Link
            data-reveal
            href={lien.href}
            className="avant-reveal label border-b border-encre pb-1.5 transition-opacity hover:opacity-55"
          >
            {lien.nom}
          </Link>
        </div>
      )}
    </section>
  );
}
