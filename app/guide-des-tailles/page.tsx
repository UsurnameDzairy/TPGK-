import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CORRESPONDANCES_VETEMENTS,
  AVERTISSEMENT_TAILLES,
  NOTE_TAILLES,
} from '@/lib/infos-boutique';
import { produits } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Guide des tailles',
  description:
    'Correspondances de tailles pour les vetements et pointures disponibles chez TPGK.',
};

export default function PageTailles() {
  // Pointures reellement presentes au catalogue, plutot qu'une echelle type.
  const pointures = [
    ...new Set(
      produits
        .flatMap((p) => p.tailles.map((t) => t.label))
        .filter((l) => /^\d{2}([.,]\d)?$/.test(l))
    ),
  ].sort((a, b) => parseFloat(a) - parseFloat(b));

  return (
    <main className="gouttiere mx-auto max-w-4xl pb-24 pt-28 md:pt-36">
      <h1 className="serif text-[clamp(2.4rem,8vw,5.5rem)] leading-[0.9]">
        Guide des tailles
      </h1>

      <p className="texte-equilibre mt-5 max-w-[52ch] text-gris">
        {NOTE_TAILLES}
      </p>

      {/* ------------------------------------------------------- vetements */}
      <section className="mt-14">
        <h2 className="label mb-5">Vetements</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[24rem] border-collapse">
            <caption className="sr-only">
              Correspondance entre les groupes de tailles TPGK et les tailles
              francaises
            </caption>
            <thead>
              <tr className="border-b border-encre">
                <th scope="col" className="label-xs py-3 text-left">
                  Groupe TPGK
                </th>
                <th scope="col" className="label-xs py-3 text-left">
                  Taille francaise
                </th>
              </tr>
            </thead>
            <tbody>
              {CORRESPONDANCES_VETEMENTS.map((c) => (
                <tr key={c.groupe} className="border-b border-filet">
                  <th scope="row" className="label-xs py-4 text-left font-medium">
                    {c.groupe}
                  </th>
                  <td className="label-xs py-4 text-gris">{c.equivaut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* L'origine de ces correspondances doit rester visible du client. */}
        <p className="label-xs mt-5 border-l-2 border-rose pl-3 text-gris">
          {AVERTISSEMENT_TAILLES}
        </p>
      </section>

      {/* ------------------------------------------------------- pointures */}
      {pointures.length > 0 && (
        <section className="mt-16">
          <h2 className="label mb-5">Chaussures</h2>
          <p className="label-xs mb-4 text-gris">
            Pointures disponibles au catalogue :
          </p>
          <ul className="flex flex-wrap gap-2">
            {pointures.map((p) => (
              <li key={p} className="label-xs border border-filet px-3 py-2">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 border-t border-filet pt-10">
        <h2 className="label mb-4">Un doute sur votre taille ?</h2>
        <p className="texte-equilibre max-w-[52ch] text-gris">
          L’equipe TPGK repond aux questions de taille avant commande.
        </p>
        <Link
          href="/contact"
          className="label mt-5 inline-block border-b border-encre pb-1 transition-opacity hover:opacity-60"
        >
          Nous ecrire
        </Link>
      </section>
    </main>
  );
}
