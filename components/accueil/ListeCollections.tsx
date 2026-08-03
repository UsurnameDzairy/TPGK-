'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { useReveal } from '@/lib/animation';
import type { Categorie } from '@/lib/catalogue';

/**
 * Toutes les collections, en index.
 *
 * Une liste sobre en fin de parcours : le visiteur qui a tout regarde sans
 * rien choisir doit pouvoir repartir par la porte qui lui convient, sans
 * rouvrir le menu.
 */
export default function ListeCollections({
  categories,
}: {
  categories: Categorie[];
}) {
  const zoneRef = useRef<HTMLElement>(null);
  useReveal(zoneRef);

  return (
    <section ref={zoneRef} className="gouttiere py-16 md:py-20">
      <h2
        data-reveal
        className="avant-reveal serif mb-10 text-center text-[clamp(1.1rem,2.2vw,1.5rem)] uppercase tracking-[0.16em]"
      >
        Toutes les collections
      </h2>

      <ul className="mx-auto grid max-w-5xl gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <li key={c.slug} data-reveal data-reveal-delai={(i % 6) * 0.04} className="avant-reveal">
            <Link
              href={`/collection/${c.slug}`}
              className="group flex items-baseline justify-between gap-4 border-b border-filet py-3 transition-colors hover:border-encre"
            >
              <span className="serif text-[clamp(0.95rem,1.7vw,1.2rem)] uppercase tracking-[0.1em] transition-transform duration-500 ease-[var(--ease-couture)] group-hover:translate-x-1.5">
                {c.nom}
              </span>
              <span aria-hidden className="label-xs text-gris opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
