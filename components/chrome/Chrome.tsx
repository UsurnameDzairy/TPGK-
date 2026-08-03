'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

import Header from './Header';
import MenuOverlay from './MenuOverlay';
import PanierDrawer from './PanierDrawer';
import Footer from './Footer';
import EcranEntree from './EcranEntree';
import BandeauProtection from './BandeauProtection';
import BandeauCookies from './BandeauCookies';
import PopupNewsletter from './PopupNewsletter';
import { ScrollTrigger, gsap, mouvementReduit } from '@/lib/animation';
import type { Categorie } from '@/lib/catalogue';

type Props = {
  categories: Categorie[];
  children: React.ReactNode;
};

/**
 * Ossature commune a toutes les pages : defilement Lenis, en-tete, menu plein
 * ecran, tiroir panier, pied de page et transition de route.
 */
export default function Chrome({ categories, children }: Props) {
  const chemin = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  /* ----------------------------------------------------- defilement Lenis */
  useEffect(() => {
    // La restauration de position native entre en conflit avec Lenis et les
    // sections epinglees : au rechargement, le navigateur repositionne la page
    // avant que ScrollTrigger ait mesure ses pins, ce qui projetait le visiteur
    // au milieu du document. On reprend la main sur le positionnement.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    if (mouvementReduit()) return;

    // Reglage volontairement court : au-dela d'environ 0,8 s d'inertie, le
    // defilement « flotte » et le visiteur a l'impression de ne plus le
    // controler. On lisse juste assez pour adoucir la molette.
    const lenis = new Lenis({
      duration: 0.75,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Le defilement tactile natif reste plus direct sur mobile.
      syncTouch: false,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Lenis pilote le defilement : ScrollTrigger doit se caler sur lui.
    lenis.on('scroll', ScrollTrigger.update);
    const boucle = (temps: number) => lenis.raf(temps * 1000);
    gsap.ticker.add(boucle);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(boucle);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* --------------------------------- verrouillage pendant menu ou tiroir */
  useEffect(() => {
    const lenis = lenisRef.current;
    if (menuOuvert) {
      lenis?.stop();
      document.documentElement.classList.add('lenis-stopped');
    } else {
      lenis?.start();
      document.documentElement.classList.remove('lenis-stopped');
    }
  }, [menuOuvert]);

  /* ------------------------------------------------- transition de route */
  useEffect(() => {
    setMenuOuvert(false);
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    const zone = zoneRef.current;
    if (!zone) return;

    // Rafraichit les declencheurs apres le rendu de la nouvelle page, puis a
    // nouveau une fois les visuels charges : une image qui arrive tard change
    // la hauteur du document et fausse toutes les positions calculees avant.
    const rafraichir = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    const rafraichirTardif = window.setTimeout(() => ScrollTrigger.refresh(), 1400);
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

    const nettoyer = () => {
      window.clearTimeout(rafraichir);
      window.clearTimeout(rafraichirTardif);
    };

    if (mouvementReduit()) {
      gsap.set(zone, { opacity: 1, y: 0 });
      return nettoyer;
    }

    const tween = gsap.fromTo(
      zone,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );

    return () => {
      nettoyer();
      tween.kill();
      // Tuer le tween en cours de route laissait la page figee a une opacite
      // intermediaire — voire nulle si la navigation s'enchainait vite. Le
      // contenu est donc remis a son etat visible quoi qu'il arrive.
      gsap.set(zone, { opacity: 1, y: 0 });
    };
  }, [chemin]);

  return (
    <>
      <EcranEntree image={categories[1]?.apercu ?? categories[0]?.apercu ?? null} />

      <Header
        categories={categories}
        menuOuvert={menuOuvert}
        onBasculerMenu={() => setMenuOuvert((v) => !v)}
      />

      <MenuOverlay
        categories={categories}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
      />

      <PanierDrawer />

      <div ref={zoneRef} id="contenu" className="min-h-screen">
        {children}
      </div>

      <Footer categories={categories} />


      <PopupNewsletter image={categories[0]?.apercu ?? null} />



      <BandeauCookies />



      <BandeauProtection />
    </>
  );
}
