'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useReveal } from '@/lib/animation';

export type Silhouette = {
  image: string;
  nom: string;
  href: string;
};

/**
 * Lookbook : une bande de silhouettes qu'on parcourt lateralement.
 *
 * Defilement horizontal natif avec accroche et deux fleches. Rien n'est
 * epingle : la page continue de repondre normalement a la molette, le
 * deplacement lateral reste une action volontaire.
 */
export default function Lookbook({
  titre,
  silhouettes,
}: {
  titre: string;
  silhouettes: Silhouette[];
}) {
  const zoneRef = useRef<HTMLElement>(null);
  const pisteRef = useRef<HTMLDivElement>(null);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(true);

  useReveal(zoneRef);

  const majFleches = useCallback(() => {
    const piste = pisteRef.current;
    if (!piste) return;
    setPeutReculer(piste.scrollLeft > 8);
    setPeutAvancer(piste.scrollLeft + piste.clientWidth < piste.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const piste = pisteRef.current;
    if (!piste) return;
    majFleches();
    piste.addEventListener('scroll', majFleches, { passive: true });
    window.addEventListener('resize', majFleches);
    return () => {
      piste.removeEventListener('scroll', majFleches);
      window.removeEventListener('resize', majFleches);
    };
  }, [majFleches, silhouettes.length]);

  const glisser = (sens: 1 | -1) => {
    const piste = pisteRef.current;
    if (!piste) return;
    piste.scrollBy({ left: sens * piste.clientWidth * 0.7, behavior: 'smooth' });
  };

  if (silhouettes.length === 0) return null;

  return (
    <section ref={zoneRef} className="py-16 md:py-20">
      <div className="gouttiere mb-8 flex items-center justify-between gap-4 md:mb-10">
        <h2
          data-reveal
          className="avant-reveal serif text-[clamp(1.1rem,2.2vw,1.5rem)] uppercase tracking-[0.16em]"
        >
          {titre}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => glisser(-1)}
            disabled={!peutReculer}
            aria-label="Silhouettes precedentes"
            className="flex h-9 w-9 items-center justify-center border border-filet text-sm transition-colors hover:border-encre disabled:opacity-25 disabled:hover:border-filet"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => glisser(1)}
            disabled={!peutAvancer}
            aria-label="Silhouettes suivantes"
            className="flex h-9 w-9 items-center justify-center border border-filet text-sm transition-colors hover:border-encre disabled:opacity-25 disabled:hover:border-filet"
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <div
        ref={pisteRef}
        className="flex snap-x snap-mandatory gap-px overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {silhouettes.map((s) => (
          <Link
            key={s.href + s.image}
            href={s.href}
            className="group shrink-0 snap-start"
          >
            <div className="relative aspect-[9/16] w-[58vw] overflow-hidden bg-lin sm:w-[36vw] md:w-[27vw] lg:w-[20vw] xl:w-[16vw]">
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(max-width: 640px) 58vw, (max-width: 1024px) 27vw, 17vw"
                quality={90}
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-couture)] group-hover:scale-[1.04]"
              />
            </div>
            <p className="produit-nom truncate px-3 pt-3">{s.nom}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
