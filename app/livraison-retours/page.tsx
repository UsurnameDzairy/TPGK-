import type { Metadata } from 'next';

import {
  LIVRAISONS,
  EXPEDITION,
  RETRAIT_MAGASIN,
  PAIEMENTS,
  SECURITE_PAIEMENT,
  SEUIL_FRANCO,
} from '@/lib/infos-boutique';

export const metadata: Metadata = {
  title: 'Livraison & retours',
  description:
    'Modes de livraison, tarifs et moyens de paiement de la boutique TPGK. Mondial Relay offert des 50 euros.',
};

export default function PageLivraison() {
  return (
    <main className="gouttiere mx-auto max-w-4xl pb-24 pt-28 md:pt-36">
      <h1 className="serif text-[clamp(2.4rem,8vw,5.5rem)] leading-[0.9]">
        Livraison & retours
      </h1>

      <p className="texte-equilibre mt-5 max-w-[52ch] text-gris">
        Toutes les commandes sont expediees depuis la France. Mondial Relay est
        offert des {SEUIL_FRANCO / 100} euros d’achat.
      </p>

      {/* ------------------------------------------------------- livraisons */}
      <section className="mt-14">
        <h2 className="label mb-5">Modes de livraison</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse">
            <caption className="sr-only">
              Tarifs de livraison selon le montant de la commande
            </caption>
            <thead>
              <tr className="border-b border-encre">
                <th scope="col" className="label-xs py-3 text-left">
                  Transporteur
                </th>
                <th scope="col" className="label-xs py-3 text-left">
                  Delai
                </th>
                <th scope="col" className="label-xs py-3 text-right">
                  Moins de {SEUIL_FRANCO / 100} EUR
                </th>
                <th scope="col" className="label-xs py-3 text-right">
                  Des {SEUIL_FRANCO / 100} EUR
                </th>
              </tr>
            </thead>
            <tbody>
              {LIVRAISONS.map((l) => (
                <tr key={l.nom} className="border-b border-filet">
                  <th scope="row" className="label-xs py-4 text-left font-medium">
                    {l.nom}
                  </th>
                  <td className="label-xs py-4 text-gris">{l.delai}</td>
                  <td className="label-xs py-4 text-right">{l.prix}</td>
                  <td className="label-xs py-4 text-right">
                    {l.prixFranco === 'Offert' ? (
                      <span className="bg-rose px-2 py-1 text-encre">Offert</span>
                    ) : (
                      l.prixFranco
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="label-xs mt-5 text-gris">{EXPEDITION}</p>
        {!RETRAIT_MAGASIN.disponible && (
          <p className="label-xs mt-2 text-gris">{RETRAIT_MAGASIN.mention}</p>
        )}
      </section>

      {/* --------------------------------------------------------- paiement */}
      <section className="mt-16">
        <h2 className="label mb-5">Paiement</h2>
        <ul className="space-y-2">
          {PAIEMENTS.map((p) => (
            <li key={p} className="label-xs text-gris">
              {p}
            </li>
          ))}
        </ul>
        <p className="texte-equilibre mt-4 max-w-[56ch] text-gris">
          {SECURITE_PAIEMENT}
        </p>
      </section>

      {/* --------------------------------------------------------- retours */}
      <section className="mt-16 border-t border-filet pt-10">
        <h2 className="label mb-4">Retours & remboursements</h2>
        <p className="texte-equilibre max-w-[56ch] text-gris">
          Les conditions de retour et de remboursement sont detaillees sur la
          boutique, ou elles font foi.
        </p>
        <a
          href="https://tpgk.fr/livraison-retour/"
          target="_blank"
          rel="noreferrer"
          className="label mt-5 inline-block border-b border-encre pb-1 transition-opacity hover:opacity-60"
        >
          Consulter les conditions completes
        </a>
      </section>
    </main>
  );
}
