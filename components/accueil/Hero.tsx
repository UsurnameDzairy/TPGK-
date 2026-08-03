'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { gsap, mouvementReduit } from '@/lib/animation';

/**
 * Hero d'accueil.
 *
 * Le plan du hero est un gros plan anime, genere a partir d'une photo reelle
 * du catalogue : la piece et son decor sont ceux de la maison, seul le
 * mouvement est calcule. Le film boucle en aller-retour, si bien que le
 * mouvement ne se coupe jamais. Le nom de la maison s'inscrit en tres grand serif au bas du cadre,
 * volontairement rogne par le bord — le mot deborde de l'ecran comme une
 * signature apposee sur l'image.
 *
 * Si la lecture automatique est refusee par le navigateur, l'image de repli
 * reste affichee : jamais de cadre vide.
 */
export default function Hero() {
  const zoneRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoActive, setVideoActive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (mouvementReduit()) {
      video.pause();
      return;
    }
    video
      .play()
      .then(() => setVideoActive(true))
      .catch(() => setVideoActive(false));
  }, []);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || mouvementReduit()) return;

    const ctx = gsap.context(() => {
      // L'ecran d'entree occupe la scene ~3,85 s au premier chargement.
      const attente = sessionStorage.getItem('tpgk-entree-vue') === '1' ? 0.15 : 3.75;
      const tl = gsap.timeline({ delay: attente });

      tl.fromTo(
        '[data-signature]',
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }
      );
      tl.fromTo(
        '[data-appel]',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        '-=1'
      );

      // Le plan derive lentement pendant que la page defile.
      gsap.to('[data-plan]', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: zone, start: 'top top', end: 'bottom top', scrub: true },
      });

      // La signature s'efface en montant : elle appartient au premier plan.
      gsap.to('[data-signature]', {
        yPercent: -28,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: zone, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, zone);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={zoneRef}
      data-hero
      className="relative h-[100svh] min-h-[34rem] overflow-hidden bg-lin"
    >
      {/* ================================================== plan plein cadre */}
      <div data-plan className="absolute inset-x-0 -top-[4%] h-[108%]">
        <Image
          src="/media/campagne-poster.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/campagne-poster.webp"
          aria-hidden
          className={[
            'absolute inset-0 h-full w-full object-cover object-center',
            'transition-opacity duration-[1200ms]',
            videoActive ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <source src="/media/campagne-tpgk.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ========================================================== appel */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          data-appel
          href="/boutique"
          className="bouton-clair label"
        >
          Decouvrir la collection
        </Link>
      </div>

      {/* ====================================================== signature */}
      {/* Le mot est volontairement rogne par le bas du cadre : c'est ce
          debordement qui lui donne son echelle. `aria-hidden` car le nom de
          la maison est deja porte par l'en-tete. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      >
        <p
          data-signature
          className="serif translate-y-[16%] whitespace-nowrap text-center text-[26vw] leading-[0.8] tracking-[0.06em] text-blanc"
        >
          TPGK
        </p>
      </div>
    </section>
  );
}
