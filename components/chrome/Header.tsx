'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { usePanier, compterArticles } from '@/lib/panier';
import BandeauAnnonce from './BandeauAnnonce';
import type { Categorie } from '@/lib/catalogue';

type Props = {
  categories: Categorie[];
  menuOuvert: boolean;
  onBasculerMenu: () => void;
};

/**
 * En-tete de la maison.
 *
 * Bandeau d'annonce, puis une barre en trois colonnes : navigation a gauche,
 * nom de la maison au centre en serif, panier a droite. Tout est en petits
 * corps espaces — l'en-tete doit se faire oublier au profit des visuels.
 *
 * Au-dessus du hero, la barre reste transparente ; des que la page defile,
 * un fond blanc et un filet la detachent du contenu.
 */
export default function Header({ categories, menuOuvert, onBasculerMenu }: Props) {
  const [pose, setPose] = useState(false);
  const [monte, setMonte] = useState(false);
  const lignes = usePanier((e) => e.lignes);
  const ouvrirPanier = usePanier((e) => e.ouvrir);

  // Le panier vient du stockage local : on n'affiche le compteur qu'apres
  // montage pour eviter une divergence avec le rendu serveur.
  useEffect(() => setMonte(true), []);

  useEffect(() => {
    const surDefilement = () => setPose(window.scrollY > 30);
    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);

  const nombre = monte ? compterArticles(lignes) : 0;

  return (
    // z-96 : au-dessus du menu plein ecran (z-95), pour que le bouton de
    // fermeture et le nom de la maison restent atteignables quand il est
    // ouvert. Le tiroir panier (z-97) passe encore au-dessus.
    <div className="fixed inset-x-0 top-0 z-[96]">
      <BandeauAnnonce />

      <header
        className={[
          'text-encre transition-[background-color,border-color] duration-500',
          pose || menuOuvert
            ? 'border-b border-filet bg-blanc'
            : 'border-b border-transparent bg-blanc/0',
        ].join(' ')}
      >
        <div className="gouttiere grid h-14 grid-cols-[1fr_auto_1fr] items-center md:h-16">
          {/* ------------------------------------------------------- gauche */}
          <nav aria-label="Navigation principale" className="flex items-center gap-6">
            <button
              type="button"
              onClick={onBasculerMenu}
              aria-expanded={menuOuvert}
              aria-controls="menu-principal"
              className="label transition-opacity hover:opacity-55"
            >
              {menuOuvert ? 'Fermer' : 'Menu'}
            </button>

            <Link href="/boutique" className="label lien-file hidden sm:inline-block">
              Boutique
            </Link>

            {categories[0] && (
              <Link
                href={`/collection/${categories[0].slug}`}
                className="label lien-file hidden lg:inline-block"
              >
                {categories[0].nom}
              </Link>
            )}

            <Link href="/maison" className="label lien-file hidden lg:inline-block">
              La maison
            </Link>
          </nav>

          {/* -------------------------------------------------------- centre */}
          <Link
            href="/"
            aria-label="TPGK — accueil"
            className="serif text-[1.4rem] tracking-[0.22em] transition-opacity hover:opacity-70 md:text-[1.65rem]"
          >
            TPGK
          </Link>

          {/* -------------------------------------------------------- droite */}
          <div className="flex items-center justify-end gap-6">
            <span className="label-xs hidden text-gris lg:inline">France (EUR)</span>

            <button
              type="button"
              onClick={ouvrirPanier}
              className="label transition-opacity hover:opacity-55"
              aria-label={
                nombre > 0
                  ? `Panier, ${nombre} article${nombre > 1 ? 's' : ''}`
                  : 'Panier, vide'
              }
            >
              Panier ({nombre})
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
