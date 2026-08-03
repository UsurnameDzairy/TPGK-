'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { gsap, mouvementReduit } from '@/lib/animation';

type Props = {
  image: string;
  intitule: string;
  titre: string;
  lien: { href: string; nom: string };
};

/**
 * Bande editoriale pleine largeur.
 *
 * Un seul plan qui occupe toute la fenetre, le texte pose en bas a gauche.
 * C'est la respiration du parcours : apres une grille de pieces, l'oeil a
 * besoin d'une image qui ne vend rien.
 */
export default function BandeEditoriale({ image, intitule, titre, lien }: Props) {
  const zoneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || mouvementReduit()) return;

    const ctx = gsap.context(() => {
      // Le plan derive plus lentement que la page : profondeur sans mouvement
      // visible.
      gsap.fromTo(
        '[data-bande-image]',
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: zone,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        '[data-bande-texte] > *',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: zone, start: 'top 65%', once: true },
        }
      );
    }, zone);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={zoneRef}
      className="relative h-[78svh] min-h-[26rem] overflow-hidden bg-lin"
    >
      <div data-bande-image className="absolute inset-x-0 -top-[6%] h-[112%]">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-[center_25%]"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-nuit/60 via-transparent to-nuit/10"
      />

      <div
        data-bande-texte
        className="gouttiere absolute inset-x-0 bottom-0 pb-10 text-blanc md:pb-14"
      >
        <p className="label-xs mb-4 opacity-80">{intitule}</p>
        <h2 className="serif max-w-[16ch] text-[clamp(1.6rem,4.4vw,3.2rem)] uppercase leading-[1.12] tracking-[0.1em]">
          {titre}
        </h2>
        <Link
          href={lien.href}
          className="label mt-7 inline-block border-b border-blanc pb-1.5 transition-opacity hover:opacity-70"
        >
          {lien.nom}
        </Link>
      </div>
    </section>
  );
}
