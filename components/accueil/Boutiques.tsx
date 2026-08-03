'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { useReveal } from '@/lib/animation';
import { BOUTIQUES } from '@/lib/maison';

/**
 * Les deux adresses physiques de la maison.
 *
 * Volontairement sans photographie : TPGK ne publie aucun visuel de ses
 * boutiques, et illustrer avec une image de catalogue laisserait croire a une
 * devanture qui n'en est pas une. Le nom des villes, en tres grand serif,
 * suffit a porter la section.
 */
export default function Boutiques() {
  const zoneRef = useRef<HTMLElement>(null);
  useReveal(zoneRef);

  return (
    <section
      ref={zoneRef}
      aria-labelledby="titre-boutiques"
      className="border-y border-filet"
    >
      <div className="gouttiere py-16 text-center md:py-24">
        <p data-reveal className="avant-reveal label-xs mb-5 text-gris">
          Nos boutiques
        </p>

        <h2
          id="titre-boutiques"
          data-reveal
          data-reveal-delai="0.05"
          className="avant-reveal serif mx-auto max-w-[20ch] text-[clamp(1.15rem,2.4vw,1.7rem)] uppercase leading-[1.35] tracking-[0.16em]"
        >
          Trois adresses sur la Cote d’Azur
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-3 md:mt-16">
          {BOUTIQUES.map((b, i) => (
            <div
              key={b.ville}
              data-reveal
              data-reveal-delai={0.1 + i * 0.08}
              className="avant-reveal"
            >
              <p className="serif text-[clamp(1.7rem,4.2vw,2.9rem)] uppercase leading-none tracking-[0.08em]">
                {b.ville}
              </p>
              {b.precision && (
                <p className="label-xs mt-3 text-gris">{b.precision}</p>
              )}
            </div>
          ))}
        </div>

        <p
          data-reveal
          data-reveal-delai="0.3"
          className="avant-reveal mx-auto mt-12 max-w-[46ch] text-gris"
        >
          Adresses detaillees et horaires disponibles aupres de la boutique.
        </p>

        <Link
          data-reveal
          data-reveal-delai="0.35"
          href="/contact"
          className="avant-reveal label mt-6 inline-block border-b border-encre pb-1.5 transition-opacity hover:opacity-55"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}
