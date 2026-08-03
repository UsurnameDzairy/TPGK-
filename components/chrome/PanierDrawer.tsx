'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { usePanier, compterArticles, totalPanier } from '@/lib/panier';
import { formaterPrix } from '@/lib/format';
import { transfererPanier, type ResultatTransfert } from '@/lib/woo';

/**
 * Tiroir panier.
 *
 * La selection vit ici, mais l'encaissement reste chez WooCommerce : au clic
 * sur « Commander », les lignes sont reellement poussees dans le panier de
 * tpgk.fr avant redirection. Si ce transfert echoue, l'erreur est affichee
 * telle quelle et des liens directs vers chaque fiche prennent le relais —
 * on n'annonce jamais une commande qui n'a pas eu lieu.
 */
export default function PanierDrawer() {
  const { lignes, ouvert, fermer, retirer, changerQuantite } = usePanier();
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<ResultatTransfert | null>(null);
  const panneauRef = useRef<HTMLDivElement>(null);

  const nombre = compterArticles(lignes);
  const total = totalPanier(lignes);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [ouvert, fermer]);

  useEffect(() => {
    if (ouvert) panneauRef.current?.focus();
    else setResultat(null);
  }, [ouvert]);

  async function commander() {
    setEnvoi(true);
    setResultat(null);
    const res = await transfererPanier(lignes);
    setResultat(res);
    setEnvoi(false);
    if (res.ok) window.location.href = res.url;
  }

  return (
    <>
      {/* voile */}
      <div
        onClick={fermer}
        aria-hidden
        className={[
          'fixed inset-0 z-[96] bg-nuit/45 transition-opacity duration-500',
          ouvert ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <aside
        ref={panneauRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        aria-hidden={!ouvert}
        className={[
          'fixed inset-y-0 right-0 z-[97] flex w-full max-w-[26.5rem] flex-col bg-blanc',
          'transition-transform duration-[600ms] ease-[var(--ease-couture)]',
          ouvert ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* -------------------------------------------------------- en-tete */}
        <div className="flex items-center justify-between border-b border-filet px-5 py-4">
          <p className="label">
            Panier <span className="opacity-45">.{nombre}</span>
          </p>
          <button
            type="button"
            onClick={fermer}
            className="label transition-opacity hover:opacity-60"
          >
            Fermer
          </button>
        </div>

        {/* -------------------------------------------------------- contenu */}
        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="serif text-3xl leading-tight">
              Votre panier est vide
            </p>
            <Link
              href="/boutique"
              onClick={fermer}
              className="label border-b border-encre pb-1 transition-opacity hover:opacity-60"
            >
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-filet overflow-y-auto">
            {lignes.map((l) => (
              <li key={`${l.produitId}-${l.taille ?? 'u'}`} className="flex gap-4 p-5">
                <Link
                  href={`/produit/${l.slug}`}
                  onClick={fermer}
                  className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden bg-lin"
                >
                  {l.image ? (
                    <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />
                  ) : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/produit/${l.slug}`}
                    onClick={fermer}
                    className="line-clamp-2 text-[0.8rem] leading-snug hover:opacity-60"
                  >
                    {l.nom}
                  </Link>

                  {l.taille ? (
                    <p className="label-xs mt-1 text-gris">Taille {l.taille}</p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-filet">
                      <button
                        type="button"
                        onClick={() => changerQuantite(l.produitId, l.taille, l.quantite - 1)}
                        aria-label={`Diminuer la quantite de ${l.nom}`}
                        className="px-2.5 py-1 text-sm transition-colors hover:bg-lin"
                      >
                        −
                      </button>
                      <span className="label-xs min-w-6 text-center">{l.quantite}</span>
                      <button
                        type="button"
                        onClick={() => changerQuantite(l.produitId, l.taille, l.quantite + 1)}
                        aria-label={`Augmenter la quantite de ${l.nom}`}
                        className="px-2.5 py-1 text-sm transition-colors hover:bg-lin"
                      >
                        +
                      </button>
                    </div>
                    <span className="label">{formaterPrix(l.prix * l.quantite)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => retirer(l.produitId, l.taille)}
                  aria-label={`Retirer ${l.nom} du panier`}
                  className="label-xs self-start text-gris transition-colors hover:text-encre"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* --------------------------------------------------------- pied */}
        {lignes.length > 0 && (
          <div className="border-t border-filet p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="label">Total</span>
              <span className="label text-sm">{formaterPrix(total)}</span>
            </div>

            {resultat && !resultat.ok && (
              <div
                role="alert"
                className="mb-4 border border-rose-sourd/40 bg-rose/10 p-3"
              >
                <p className="label-xs mb-2 text-rose-sourd">
                  Transfert vers la boutique impossible
                </p>
                <p className="mb-2 text-[0.75rem] leading-snug text-gris">
                  {resultat.erreur}
                </p>
                {resultat.replis.length > 0 && (
                  <>
                    <p className="label-xs mb-1.5">Commander article par article :</p>
                    <ul className="space-y-1">
                      {resultat.replis.map((r) => (
                        <li key={r.url}>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.75rem] underline underline-offset-2 hover:opacity-60"
                          >
                            {r.nom}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={commander}
              disabled={envoi}
              className="label w-full bg-encre px-5 py-3.5 text-blanc transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {envoi ? 'Transfert en cours…' : 'Commander'}
            </button>

            <p className="label-xs mt-3 text-center text-gris">
              Paiement securise sur tpgk.fr
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
