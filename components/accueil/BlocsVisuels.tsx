'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { gsap, mouvementReduit } from '@/lib/animation';

export type BlocVisuel = {
  image: string;
  titre: string;
  href: string;
};

/**
 * Blocs de collection, plein cadre et bord a bord.
 *
 * Deux visuels par rangee sur grand ecran, sans aucune gouttiere : l'image
 * touche les bords de la fenetre. Le nom de la collection est pose en
 * surimpression, en serif capitales tres espacees — pas de paragraphe, pas de
 * bouton. Le visuel dit tout, le mot le nomme.
 *
 * Une bande sombre discrete court sous le titre pour garantir la lisibilite
 * quelle que soit la photo, sans assombrir l'ensemble du cadre.
 */
export default function BlocsVisuels({ blocs }: { blocs: BlocVisuel[] }) {
  const zoneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || mouvementReduit()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-bloc]').forEach((bloc) => {
        gsap.fromTo(
          bloc,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.25,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: bloc, start: 'top 82%', once: true },
          }
        );

        // Derive lente : la photo bouge moins vite que la page.
        gsap.fromTo(
          bloc.querySelector('[data-bloc-image]'),
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: bloc,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, zone);

    return () => ctx.revert();
  }, [blocs.length]);

  return (
    <section ref={zoneRef} className="grid grid-cols-1 md:grid-cols-2">
      {blocs.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          data-bloc
          className="group relative block aspect-[3/4] overflow-hidden bg-lin md:aspect-[4/5]"
        >
          <div data-bloc-image className="absolute inset-x-0 -top-[4%] h-[108%]">
            <Image
              src={b.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="object-cover object-[center_22%] transition-transform duration-[1400ms] ease-[var(--ease-couture)] group-hover:scale-[1.03]"
            />
          </div>

          {/* Voile localise : juste ce qu'il faut sous le titre. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-nuit/35 to-transparent"
          />

          <h2 className="serif absolute left-6 top-[38%] text-[clamp(1.5rem,3.4vw,2.6rem)] uppercase tracking-[0.13em] text-blanc md:left-10">
            {b.titre}
          </h2>
        </Link>
      ))}
    </section>
  );
}
