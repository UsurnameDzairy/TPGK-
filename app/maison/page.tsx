import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { MAISON, BOUTIQUES } from '@/lib/maison';
import { produits, categoriesNav } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'La maison',
  description:
    'TPGK, enseigne francaise de pret-a-porter feminin depuis plus de dix ans, avec trois boutiques sur la Cote d’Azur a Cannes, Antibes – Juan-les-Pins et Nice.',
};

export default function PageMaison() {
  const collections = categoriesNav();
  const galerie = produits.slice(4, 9).map((p) => p.images[0].src);

  return (
    <main>
      {/* ============================ ouverture ========================== */}
      <section className="gouttiere pb-16 pt-32 md:pb-24 md:pt-44">
        <p className="label-xs mb-7 text-gris">La maison</p>

        <h1 className="text-[clamp(2.8rem,12vw,10rem)] leading-[0.9]">
          Le vestiaire
          <br />
          <span className="serif italic normal-case">de la Riviera</span>
        </h1>

        <div className="mt-12 grid gap-8 border-t border-filet pt-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <p className="label-xs text-gris">
            {MAISON.nature}
            <br />
            {MAISON.anciennete} d’existence
          </p>

          <div className="max-w-[54ch] space-y-5 text-[1.05rem] leading-relaxed">
            <p className="texte-equilibre">
              TPGK habille les femmes depuis plus de dix ans. La maison tient
              trois boutiques physiques sur la Cote d’Azur, a{' '}
              {BOUTIQUES.map((b, i) => (
                <span key={b.ville}>
                  <strong className="font-medium">{b.ville}</strong>
                  {b.precision ? ` – ${b.precision}` : ''}
                  {i < BOUTIQUES.length - 1 ? ' et a ' : ''}
                </span>
              ))}
              .
            </p>
            <p className="texte-equilibre text-gris">
              {MAISON.philosophie}
            </p>
          </div>
        </div>
      </section>

      {/* ============================ bande d'images ===================== */}
      <section aria-hidden className="overflow-hidden">
        <div className="flex gap-2 md:gap-3">
          {galerie.map((src, i) => (
            <div
              key={src}
              className={[
                'relative aspect-[9/16] flex-1 overflow-hidden bg-lin',
                i > 2 ? 'hidden md:block' : '',
              ].join(' ')}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 33vw, 20vw"
                quality={90}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============================ boutiques ========================== */}
      <section className="gouttiere py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <h2 className="text-[clamp(2rem,6vw,4.5rem)] leading-[0.9]">
              Trois adresses
              <br />
              sur le littoral
            </h2>
            <p className="texte-equilibre mt-6 max-w-[44ch] text-gris">
              La selection en ligne prolonge les boutiques : memes pieces, meme
              exigence sur les matieres et le tombe.
            </p>
          </div>

          <ul className="divide-y divide-filet border-y border-filet">
            {BOUTIQUES.map((b, i) => (
              <li key={b.ville} className="flex items-baseline justify-between gap-4 py-6">
                <div>
                  <p className="serif text-[clamp(1.6rem,4vw,2.8rem)] uppercase leading-none">
                    {b.ville}
                  </p>
                  {b.precision && (
                    <p className="label-xs mt-2 text-gris">{b.precision}</p>
                  )}
                </div>
                <span className="label-xs shrink-0 text-gris">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Adresses precises : non publiees sur la boutique, donc non
            inventees ici. Le visiteur est renvoye au canal officiel. */}
        <p className="label-xs mt-8 text-gris">
          Adresses detaillees et horaires disponibles aupres de la boutique.{' '}
          <a
            href="https://tpgk.fr/nos-boutiques/"
            target="_blank"
            rel="noreferrer"
            className="lien-file text-encre"
          >
            Nous contacter
          </a>
        </p>
      </section>

      {/* ============================ collections ======================== */}
      <section className="gouttiere border-t border-filet py-20 md:py-28">
        <h2 className="text-[clamp(1.8rem,5vw,3.6rem)] leading-none">
          Explorer les collections
        </h2>

        <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => (
            <li key={c.slug}>
              <Link
                href={`/collection/${c.slug}`}
                className="group flex items-baseline justify-between gap-4 border-b border-filet py-3 transition-colors hover:border-encre"
              >
                <span className="serif text-[clamp(1.1rem,2.4vw,1.7rem)] uppercase leading-none transition-transform duration-500 ease-[var(--ease-couture)] group-hover:translate-x-1.5">
                  {c.nom}
                </span>
                <span className="label-xs shrink-0 text-gris">
                  {c.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
