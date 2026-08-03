'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { gsap, mouvementReduit } from '@/lib/animation';
import type { Categorie } from '@/lib/catalogue';

type Props = {
  categories: Categorie[];
  ouvert: boolean;
  onFermer: () => void;
};

const PAGES = [
  { nom: 'Toutes les pieces', href: '/boutique' },
  { nom: 'La maison', href: '/maison' },
  { nom: 'Guide des tailles', href: '/guide-des-tailles' },
  { nom: 'Livraison & retours', href: '/livraison-retours' },
  { nom: 'Contact', href: '/contact' },
];

/**
 * Menu plein ecran.
 *
 * Fond blanc, liste sobre a gauche, visuel de la collection survolee a droite.
 *
 * Aucun compteur d'articles n'est affiche : sur une vitrine de mode, annoncer
 * « 09 » a cote d'une collection la deprecie au lieu de la presenter. Le
 * chiffre appartient a la page de collection, pas au menu.
 */
export default function MenuOverlay({ categories, ouvert, onFermer }: Props) {
  const panneauRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* ------------------------------------------------ fermeture au clavier */
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [ouvert, onFermer]);

  /* ------------------------------------------ piege de focus a l'ouverture */
  useEffect(() => {
    if (!ouvert) return;
    const panneau = panneauRef.current;
    if (!panneau) return;

    const focusables = panneau.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusables[0]?.focus();

    const surTabulation = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusables.length === 0) return;
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };

    panneau.addEventListener('keydown', surTabulation);
    return () => panneau.removeEventListener('keydown', surTabulation);
  }, [ouvert]);

  /* --------------------------------------------------- animation d'entree */
  useEffect(() => {
    const panneau = panneauRef.current;
    if (!panneau || !ouvert || mouvementReduit()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-menu-ligne]',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        '[data-menu-annexe]',
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: 0.03, delay: 0.3 }
      );
    }, panneau);

    return () => ctx.revert();
  }, [ouvert]);

  const collection = categories[active];

  return (
    <div
      id="menu-principal"
      ref={panneauRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
      aria-hidden={!ouvert}
      className={[
        'fixed inset-0 z-[95] bg-blanc text-encre transition-[opacity,visibility] duration-400',
        ouvert ? 'visible opacity-100' : 'invisible opacity-0',
      ].join(' ')}
    >
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_42vw]">
        {/* ================================================ colonne texte */}
        <div className="gouttiere flex h-full min-h-0 flex-col overflow-y-auto pb-14 pt-28 md:pt-32">
          <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none lg:pl-6">
            <nav aria-label="Collections">
              <p className="label-xs mb-6 text-gris">Collections</p>
              <ul className="space-y-0.5">
                {categories.map((c, i) => (
                  <li key={c.slug} data-menu-ligne>
                    <Link
                      href={`/collection/${c.slug}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={onFermer}
                      className={[
                        // Corps calibre pour que les quatorze collections ET
                        // les liens de service tiennent sans defilement sur un
                        // ecran courant.
                        'serif inline-block py-0.5 text-[clamp(1.15rem,2.1vw,1.7rem)]',
                        'transition-opacity duration-300',
                        active === i ? 'opacity-100' : 'opacity-45 hover:opacity-100',
                      ].join(' ')}
                    >
                      {c.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="La maison" className="mt-9">
              <p className="label-xs mb-5 text-gris">La maison</p>
              <ul className="space-y-2.5">
                {PAGES.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      onClick={onFermer}
                      data-menu-annexe
                      className="label lien-file"
                    >
                      {p.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div data-menu-annexe className="mt-12 space-y-1">
              <p className="label-xs text-gris">Cannes — Antibes — Nice</p>
              <p className="label-xs text-gris">Stock en France</p>
            </div>
          </div>
        </div>

        {/* ==================================================== visuel */}
        <div className="relative hidden overflow-hidden bg-lin lg:block">
          {categories.map((c, i) => (
            <div
              key={c.slug}
              aria-hidden
              className={[
                'absolute inset-0 transition-opacity duration-700 ease-[var(--ease-couture)]',
                active === i ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              {c.apercu && (
                <Image
                  src={c.apercu}
                  alt=""
                  fill
                  sizes="42vw"
                  quality={90}
                  className="object-cover object-[center_18%]"
                />
              )}
            </div>
          ))}

          {/* Le nom est pose sur un fond degrade plutot qu'en mix-blend :
              selon la photo survolee, le blend le rendait illisible. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-nuit/70 to-transparent p-8 pt-24"
          >
            <p className="label text-blanc">{collection?.nom}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
