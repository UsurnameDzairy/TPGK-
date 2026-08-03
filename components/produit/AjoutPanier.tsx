'use client';

import { useState } from 'react';

import { usePanier } from '@/lib/panier';
import { formaterPrix } from '@/lib/format';
import { lienProduit } from '@/lib/woo';
import type { Produit } from '@/lib/catalogue';

/**
 * Choix de la taille et mise au panier.
 *
 * Le bouton reste actif meme sans taille choisie : un bouton desactive
 * n'explique pas pourquoi il l'est, ne recoit pas le focus et laisse le
 * visiteur sans recours. On accepte le clic, puis on designe precisement ce
 * qui manque et on deplace le focus sur les tailles.
 */
export default function AjoutPanier({ produit }: { produit: Produit }) {
  const ajouter = usePanier((e) => e.ajouter);
  const [taille, setTaille] = useState<string | null>(
    produit.tailles.length === 1 ? produit.tailles[0].label : null
  );
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajoute, setAjoute] = useState(false);

  const tailleRequise = produit.tailles.length > 0;

  function surAjout() {
    if (tailleRequise && !taille) {
      setErreur('Choisissez une taille pour continuer.');
      document.getElementById('choix-taille')?.focus();
      return;
    }

    setErreur(null);

    // On transmet l'identifiant de variation quand la taille en designe une :
    // c'est lui que WooCommerce attend pour un produit decline.
    const choisie = produit.tailles.find((t) => t.label === taille);
    const variation = choisie
      ? produit.variations.find((v) => v.attributs.includes(choisie.slug))
      : undefined;

    ajouter({
      produitId: produit.id,
      variationId: variation?.id ?? null,
      slug: produit.slug,
      nom: produit.nom,
      prix: produit.prix,
      taille,
      image: produit.images[0]?.src ?? null,
    });

    setAjoute(true);
    window.setTimeout(() => setAjoute(false), 2200);
  }

  return (
    <div>
      {/* ---------------------------------------------------------- tailles */}
      {tailleRequise && (
        <fieldset className="mb-6">
          <legend className="label-xs mb-2.5 flex w-full items-center justify-between text-gris">
            <span>Taille</span>
            <a
              href="/guide-des-tailles"
              className="lien-file text-encre"
            >
              Guide des tailles
            </a>
          </legend>

          <div id="choix-taille" tabIndex={-1} className="flex flex-wrap gap-2">
            {produit.tailles.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => {
                  setTaille(t.label);
                  setErreur(null);
                }}
                aria-pressed={taille === t.label}
                className={[
                  'label-xs min-w-[3.4rem] border px-3 py-2.5 transition-colors',
                  taille === t.label
                    ? 'border-encre bg-encre text-blanc'
                    : 'border-filet hover:border-gris',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* ---------------------------------------------------------- erreur */}
      {erreur && (
        <p role="alert" className="label-xs mb-3 text-rose-sourd">
          {erreur}
        </p>
      )}

      {/* --------------------------------------------------------- actions */}
      <button
        type="button"
        onClick={surAjout}
        disabled={!produit.enStock}
        className="label flex w-full items-center justify-between bg-encre px-5 py-4 text-blanc transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>
          {!produit.enStock
            ? 'Piece epuisee'
            : ajoute
              ? 'Ajoute au panier'
              : 'Ajouter au panier'}
        </span>
        <span aria-hidden>{formaterPrix(produit.prix)}</span>
      </button>

      {/* Message pour lecteurs d'ecran, hors du bouton pour etre annonce. */}
      <p aria-live="polite" className="sr-only">
        {ajoute ? `${produit.nom} ajoute au panier.` : ''}
      </p>

      <a
        href={lienProduit(produit.slug)}
        target="_blank"
        rel="noreferrer"
        className="label-xs mt-3 block text-center text-gris underline underline-offset-4 transition-colors hover:text-encre"
      >
        Voir cette piece sur tpgk.fr
      </a>
    </div>
  );
}
