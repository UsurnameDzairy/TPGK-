'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { formaterPrix, prixAccessible } from '@/lib/format';
import type { ProduitCarte } from '@/lib/catalogue';

type Props = {
  produit: ProduitCarte;
  /** Charge l'image sans attendre : reserve aux premieres cartes visibles. */
  prioritaire?: boolean;
  /** Tailles CSS de l'image, alignees sur la densite de la grille. */
  sizes?: string;
  /**
   * Grille collee aux bords de la fenetre : le texte reprend alors une
   * petite marge interieure pour ne pas toucher le bord de l'ecran.
   */
  bordABord?: boolean;
};

/**
 * Carte produit.
 *
 * Au survol, la seconde photo apparait en fondu. Pas de volet ni de bascule
 * spectaculaire : dans un vestiaire de cette tenue, l'effet doit se remarquer
 * moins que la piece.
 *
 * Le nom et le prix partagent une seule ligne, alignes aux deux bords du
 * cadre. Le nom est tronque plutot que renvoye a la ligne : sur une grille
 * entiere, des cartes de hauteurs inegales cassent l'alignement horizontal.
 */
export default function CarteProduit({
  produit,
  prioritaire = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  bordABord = false,
}: Props) {
  const [survol, setSurvol] = useState(false);

  const [visuel, second] = produit.images;
  const aDeuxVisuels = Boolean(second);
  const enRemise = produit.enPromo && produit.prixReference > produit.prix;

  return (
    <article
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocus={() => setSurvol(true)}
      onBlur={() => setSurvol(false)}
    >
      <Link href={`/produit/${produit.slug}`} className="block">
        {/* ------------------------------------------------------- visuel */}
        <div className="relative aspect-[9/16] overflow-hidden bg-lin">
          <Image
            src={visuel.src}
            alt={visuel.alt}
            fill
            sizes={sizes}
            priority={prioritaire}
            quality={90}
            className={[
              'object-cover transition-opacity duration-[900ms] ease-[var(--ease-couture)]',
              survol && aDeuxVisuels ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          />

          {aDeuxVisuels && (
            <Image
              src={second.src}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              quality={90}
              className={[
                'object-cover transition-opacity duration-[900ms] ease-[var(--ease-couture)]',
                survol ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            />
          )}

          {!produit.enStock && (
            <span className="label-xs absolute left-3 top-3 bg-blanc/90 px-2 py-1 text-gris">
              Epuise
            </span>
          )}

          {enRemise && (
            <span className="label-xs absolute left-3 top-3 bg-rose px-2 py-1 text-encre">
              Remise
            </span>
          )}
        </div>

        {/* -------------------------------------------------------- infos */}
        <div
          className={[
            'flex items-baseline justify-between gap-3 pt-3',
            bordABord ? 'px-3' : '',
          ].join(' ')}
        >
          <h3 className="produit-nom min-w-0 flex-1 truncate">{produit.nom}</h3>

          <p className="produit-prix flex shrink-0 items-baseline gap-2">
            {enRemise && (
              <span aria-hidden className="text-gris line-through">
                {formaterPrix(produit.prixReference)}
              </span>
            )}
            <span aria-hidden className={enRemise ? 'text-rose-sourd' : 'text-gris'}>
              {formaterPrix(produit.prix)}
            </span>
            <span className="sr-only">
              {enRemise
                ? `en remise, ${prixAccessible(produit.prix)} au lieu de ${prixAccessible(produit.prixReference)}`
                : prixAccessible(produit.prix)}
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}
