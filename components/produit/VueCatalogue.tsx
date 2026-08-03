'use client';

import { useMemo, useRef, useState } from 'react';

import CarteProduit from './CarteProduit';
import { useReveal } from '@/lib/animation';
import type { ProduitCarte } from '@/lib/catalogue';

type Tri = 'nouveaute' | 'prix-croissant' | 'prix-decroissant' | 'alpha';

type Props = {
  produits: ProduitCarte[];
  titre: string;
  chapeau?: string;
};

const TRIS: { valeur: Tri; nom: string }[] = [
  { valeur: 'nouveaute', nom: 'Nouveautes' },
  { valeur: 'alpha', nom: 'Alphabetique, A–Z' },
  { valeur: 'prix-croissant', nom: 'Prix croissant' },
  { valeur: 'prix-decroissant', nom: 'Prix decroissant' },
];

/**
 * Vue catalogue.
 *
 * Le titre est pose au centre, en serif et en petit corps ; les filtres se
 * rangent sur une seule ligne de part et d'autre. Toute la place restante
 * revient aux pieces.
 */
export default function VueCatalogue({ produits, titre, chapeau }: Props) {
  const [tri, setTri] = useState<Tri>('nouveaute');
  const [taille, setTaille] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const zoneRef = useRef<HTMLElement>(null);

  useReveal(zoneRef);

  const taillesDisponibles = useMemo(() => {
    const vues = new Set<string>();
    for (const p of produits) for (const t of p.tailles) vues.add(t.label);

    // Ordre de vetement, du plus petit au plus grand. Un tri alphabetique
    // donnait « L, M, S, XL, XS », ce qui n'aide personne a choisir sa taille.
    // Les pointures suivent, triees numeriquement.
    const ORDRE = [
      'XXS', 'XS', 'XS/S', 'S', 'S/M', 'M', 'M/L',
      'L', 'L/XL', 'XL', 'XL/XXL', 'XXL', 'TU',
    ];
    const rang = (label: string) => {
      const i = ORDRE.indexOf(label.toUpperCase());
      if (i !== -1) return i;
      const n = parseFloat(label.replace(',', '.'));
      return Number.isNaN(n) ? 900 : 1000 + n;
    };

    return [...vues].sort((a, b) => rang(a) - rang(b));
  }, [produits]);

  const affiches = useMemo(() => {
    const lot = taille
      ? produits.filter((p) => p.tailles.some((t) => t.label === taille))
      : [...produits];

    switch (tri) {
      case 'prix-croissant':
        return lot.sort((a, b) => a.prix - b.prix);
      case 'prix-decroissant':
        return lot.sort((a, b) => b.prix - a.prix);
      case 'alpha':
        return lot.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      default:
        return lot;
    }
  }, [produits, taille, tri]);

  return (
    <section ref={zoneRef} className="pb-24 pt-24 md:pt-28">
      {/* ======================================================== titre */}
      <header className="gouttiere pb-6 text-center">
        <h1 className="serif text-[clamp(1.1rem,2.2vw,1.5rem)] uppercase tracking-[0.16em]">
          {titre}
        </h1>
        {chapeau && (
          <p className="texte-equilibre mx-auto mt-3 max-w-[52ch] text-gris">
            {chapeau}
          </p>
        )}
      </header>

      {/* ====================================================== filtres */}
      <div className="gouttiere flex items-center justify-between gap-4 pb-4">
        <button
          type="button"
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          aria-controls="panneau-filtres"
          className="label flex items-center gap-2.5 transition-opacity hover:opacity-55"
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-px w-3.5 bg-current" />
            <span className="block h-px w-3.5 bg-current" />
            <span className="block h-px w-3.5 bg-current" />
          </span>
          Filtrer et trier
        </button>

        <p className="label-xs text-gris">
          {affiches.length} piece{affiches.length > 1 ? 's' : ''}
        </p>

        <label className="flex items-center gap-2">
          <span className="sr-only">Trier les pieces</span>
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value as Tri)}
            className="label cursor-pointer border-0 bg-transparent py-1 pr-1 transition-opacity hover:opacity-55 focus:outline-none focus-visible:outline focus-visible:outline-1"
          >
            {TRIS.map((t) => (
              <option key={t.valeur} value={t.valeur}>
                {t.nom}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ------------------------------------------------ panneau tailles */}
      {filtresOuverts && (
        <div
          id="panneau-filtres"
          className="gouttiere border-y border-filet py-4"
        >
          <p className="label-xs mb-3 text-gris">Taille</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTaille(null)}
              aria-pressed={taille === null}
              className={[
                'label-xs border px-3 py-2 transition-colors',
                taille === null
                  ? 'border-encre bg-encre text-blanc'
                  : 'border-filet hover:border-encre',
              ].join(' ')}
            >
              Toutes
            </button>
            {taillesDisponibles.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTaille(taille === t ? null : t)}
                aria-pressed={taille === t}
                className={[
                  'label-xs border px-3 py-2 transition-colors',
                  taille === t
                    ? 'border-encre bg-encre text-blanc'
                    : 'border-filet hover:border-encre',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================= grille */}
      {affiches.length === 0 ? (
        <p className="py-32 text-center text-gris">
          Aucune piece ne correspond a ce filtre.
        </p>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-x-px gap-y-8 md:grid-cols-4 md:gap-y-12 xl:grid-cols-5">
          {affiches.map((p, i) => (
            <div key={p.id} data-reveal className="avant-reveal">
              <CarteProduit
                produit={p}
                prioritaire={i < 4}
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
              bordABord
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
