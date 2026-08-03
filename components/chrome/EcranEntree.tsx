'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { gsap, mouvementReduit } from '@/lib/animation';

const CLE_SESSION = 'tpgk-entree-vue';

/**
 * Ecran d'entree.
 *
 * Un visuel de campagne occupe tout le cadre, assombri juste ce qu'il faut
 * pour porter le nom de la maison. Le wordmark se compose lettre par lettre,
 * un filet se trace dessous, et une reglette de progression court en bas de
 * page. Le rideau se retire ensuite vers le haut.
 *
 * Le traitement typographique fait tout le travail : capitales, corps mesure,
 * interlettrage tres large. Un nom de maison gagne a etre pose, pas crie —
 * l'ancienne version l'affichait en 15vw serre, ce qui ecrasait le mot au
 * lieu de le presenter.
 *
 * Ne se joue qu'une fois par session, et jamais en mouvement reduit.
 */
export default function EcranEntree({ image }: { image?: string | null }) {
  const [actif, setActif] = useState(false);
  const [pret, setPret] = useState(false);
  const ecranRef = useRef<HTMLDivElement>(null);
  const jaugeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // `?entree` rejoue la sequence, meme si elle a deja ete vue dans la
    // session. Un ecran d'ouverture ne s'affichant qu'une fois est autrement
    // impossible a montrer ou a faire valider sans vider son navigateur.
    const rejouer = new URLSearchParams(window.location.search).has('entree');

    const dejaVu = sessionStorage.getItem(CLE_SESSION) === '1';
    if ((dejaVu && !rejouer) || mouvementReduit()) {
      setPret(true);
      return;
    }
    setActif(true);
    setPret(true);
    document.documentElement.classList.add('lenis-stopped');
  }, []);

  useEffect(() => {
    if (!actif) return;
    const ecran = ecranRef.current;
    if (!ecran) return;

    const ctx = gsap.context(() => {
      const progression = { valeur: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem(CLE_SESSION, '1');
          document.documentElement.classList.remove('lenis-stopped');
          setActif(false);
        },
      });

      // 1. Le visuel se devoile et se rapproche tres lentement.
      tl.fromTo(
        '[data-entree-visuel]',
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.4, ease: 'power2.out' },
        0
      );

      // 2. Les lettres montent une a une depuis leur masque.
      tl.fromTo(
        '[data-lettre]',
        { yPercent: 112, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.085, ease: 'power4.out' },
        0.35
      );

      // 3. Le filet se trace sous le nom.
      tl.fromTo(
        '[data-filet]',
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: 'power2.inOut' },
        1.05
      );

      tl.fromTo(
        '[data-sous-titre]',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.35
      );

      // 4. Reglette de progression.
      tl.fromTo(
        '[data-jauge]',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: 'power1.inOut' },
        0.4
      );
      tl.to(
        progression,
        {
          valeur: 100,
          duration: 1.6,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (jaugeRef.current) {
              jaugeRef.current.textContent = String(Math.round(progression.valeur));
            }
          },
        },
        0.4
      );

      // 5. Le rideau se retire.
      tl.to('[data-entree-contenu]', {
        opacity: 0,
        y: -18,
        duration: 0.6,
        ease: 'power2.in',
      });
      tl.to(
        ecran,
        { yPercent: -100, duration: 1.1, ease: 'expo.inOut' },
        '-=0.25'
      );
    }, ecran);

    return () => ctx.revert();
  }, [actif]);

  if (!pret || !actif) return null;

  return (
    <div
      ref={ecranRef}
      role="status"
      aria-live="polite"
      aria-label="Chargement de la boutique TPGK"
      className="fixed inset-0 z-[200] overflow-hidden bg-nuit"
    >
      {/* ---------------------------------------------------------- visuel */}
      {image && (
        <div data-entree-visuel className="absolute inset-0">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover object-[center_22%]"
          />
          {/* Voile : le nom doit rester lisible quelle que soit la photo. */}
          <div aria-hidden className="absolute inset-0 bg-nuit/55" />
        </div>
      )}

      {/* --------------------------------------------------------- contenu */}
      <div
        data-entree-contenu
        className="relative flex h-full flex-col items-center justify-center px-6 text-blanc"
      >
        <div className="flex">
          {['T', 'P', 'G', 'K'].map((lettre) => (
            <span key={lettre} className="overflow-hidden">
              <span
                data-lettre
                className="serif block text-[clamp(2.6rem,8vw,5.5rem)] font-normal leading-none"
                style={{ letterSpacing: '0.3em', paddingLeft: '0.3em' }}
              >
                {lettre}
              </span>
            </span>
          ))}
        </div>

        <div
          data-filet
          className="mt-7 h-px w-[min(20rem,58vw)] origin-center bg-blanc/40"
        />

        <p
          data-sous-titre
          className="label-xs mt-6 opacity-0"
          style={{ letterSpacing: '0.5em', paddingLeft: '0.5em' }}
        >
          Boutique
        </p>

        {/* ------------------------------------------------------ reglette */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-10">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <span className="label-xs tabular-nums opacity-70">
              <span ref={jaugeRef}>0</span>
            </span>
            <span className="h-px flex-1 bg-blanc/20">
              <span
                data-jauge
                className="block h-px origin-left bg-blanc"
                style={{ transform: 'scaleX(0)' }}
              />
            </span>
            <span className="label-xs opacity-70">Cote d’Azur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
