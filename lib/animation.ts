'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Vrai lorsque le systeme demande a limiter les animations.
 * Toute animation non decorative doit court-circuiter sur cette valeur.
 */
export function mouvementReduit(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Contexte GSAP a la duree de vie du composant.
 * `gsap.context` nettoie automatiquement tweens et ScrollTriggers au demontage,
 * ce qui evite les animations fantomes lors des changements de route.
 */
export function useGsap(
  /** Peut renvoyer une fonction de nettoyage : `gsap.context` l'appellera au revert. */
  effet: (ctx: gsap.Context) => void | (() => void),
  portee?: React.RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useEffect(() => {
    const ctx = gsap.context((self) => {
      if (mouvementReduit()) return;
      effet(self);
    }, portee?.current ?? undefined);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Reveal au scroll : le contenu monte et se devoile a l'entree dans le cadre.
 * Cible les elements portant `data-reveal` dans la portee donnee.
 *
 * En mouvement reduit, aucun tween n'est cree et la regle CSS
 * `prefers-reduced-motion` rend les elements visibles immediatement.
 */
export function useReveal(portee: React.RefObject<HTMLElement | null>) {
  useGsap(() => {
    const cibles = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    if (!cibles.length) return;

    cibles.forEach((cible) => {
      const decalage = Number(cible.dataset.revealDelai ?? 0);
      gsap.fromTo(
        cible,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: decalage,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cible,
            start: 'top 92%',
            once: true,
            // Un element deja visible au chargement ne doit pas attendre un
            // declencheur pour apparaitre.
            fastScrollEnd: true,
          },
        }
      );
    });

    // Filet de securite : si un declencheur n'aboutit pas — mesure faussee par
    // une image chargee tard, une section collante, un changement de route —
    // le contenu concerne est revele d'office. Une page blanche est un defaut
    // bien plus grave qu'une animation manquee.
    const secours = window.setTimeout(() => {
      cibles.forEach((cible) => {
        if (Number(getComputedStyle(cible).opacity) < 0.05) {
          gsap.set(cible, { opacity: 1, y: 0, clearProps: 'transform' });
        }
      });
    }, 2600);

    return () => window.clearTimeout(secours);
  }, portee);
}

/**
 * Parallaxe verticale douce sur les visuels portant `data-parallaxe`.
 * L'amplitude reste faible : elle doit suggerer la profondeur, pas se voir.
 */
export function useParallaxe(portee: React.RefObject<HTMLElement | null>) {
  useGsap(() => {
    const cibles = gsap.utils.toArray<HTMLElement>('[data-parallaxe]');
    cibles.forEach((cible) => {
      const amplitude = Number(cible.dataset.parallaxe ?? 12);
      gsap.fromTo(
        cible,
        { yPercent: -amplitude / 2 },
        {
          yPercent: amplitude / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: cible.parentElement ?? cible,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  }, portee);
}

/**
 * Decoupe un texte en mots enveloppes, pour un reveal ligne par ligne.
 * Renvoie les elements crees afin que l'appelant les anime.
 */
export function decouperEnMots(element: HTMLElement): HTMLElement[] {
  if (element.dataset.decoupe === 'fait') {
    return Array.from(element.querySelectorAll<HTMLElement>('.mot-interne'));
  }

  const texte = element.textContent ?? '';
  element.textContent = '';

  const mots = texte.split(/\s+/).filter(Boolean);
  const internes: HTMLElement[] = [];

  mots.forEach((mot, i) => {
    const masque = document.createElement('span');
    masque.className = 'inline-block overflow-hidden align-bottom';

    const interne = document.createElement('span');
    interne.className = 'mot-interne inline-block';
    interne.textContent = mot;

    masque.appendChild(interne);
    element.appendChild(masque);
    if (i < mots.length - 1) element.appendChild(document.createTextNode(' '));
    internes.push(interne);
  });

  element.dataset.decoupe = 'fait';
  return internes;
}

/** Reference typee, pratique pour les portees d'animation. */
export function usePortee<T extends HTMLElement>() {
  return useRef<T>(null);
}
