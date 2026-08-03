import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import GalerieProduit from '@/components/produit/GalerieProduit';
import AjoutPanier from '@/components/produit/AjoutPanier';
import CarteProduit from '@/components/produit/CarteProduit';
import DonneesStructurees from '@/components/produit/DonneesStructurees';
import { formaterPrix, prixAccessible } from '@/lib/format';
import {
  produits,
  produitParSlug,
  produitsSimilaires,
  versCarte,
} from '@/lib/catalogue';
import {
  LIVRAISONS,
  EXPEDITION,
  RETRAIT_MAGASIN,
  PAIEMENTS,
  SECURITE_PAIEMENT,
  SEUIL_FRANCO,
} from '@/lib/infos-boutique';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return produits.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produit = produitParSlug(slug);
  if (!produit) return { title: 'Piece introuvable' };

  return {
    title: produit.nom,
    description: produit.resume.slice(0, 300) || produit.description.slice(0, 300),
    openGraph: {
      title: produit.nom,
      images: produit.images[0] ? [{ url: produit.images[0].src }] : undefined,
    },
  };
}

export default async function PageProduit({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const produit = produitParSlug(slug);
  if (!produit) notFound();

  const similaires = produitsSimilaires(produit, 4);
  const categoriePrincipale =
    produit.categories.find((c) => c.slug !== 'vetement') ?? produit.categories[0];

  return (
    <main className="gouttiere pb-24 pt-24 md:pt-32">
      <DonneesStructurees produit={produit} />
      {/* --------------------------------------------------- fil d'ariane */}
      <nav aria-label="Fil d’ariane" className="mb-6">
        <ol className="label-xs flex flex-wrap items-center gap-2 text-gris">
          <li>
            <Link href="/" className="lien-file">
              Accueil
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/boutique" className="lien-file">
              Boutique
            </Link>
          </li>
          {categoriePrincipale && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/collection/${categoriePrincipale.slug}`}
                  className="lien-file"
                >
                  {categoriePrincipale.nom}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        {/* ------------------------------------------------------ galerie */}
        <div className="lg:-mx-4 xl:mx-0">
          <GalerieProduit images={produit.images} nom={produit.nom} />
        </div>

        {/* ------------------------------------------------------ panneau */}
        <div className="lg:sticky lg:top-[6rem] lg:self-start">
          {categoriePrincipale && (
            <p className="label-xs mb-3 text-gris">{categoriePrincipale.nom}</p>
          )}

          <h1 className="serif text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.02]">
            {produit.nom}
          </h1>

          <p className="label mt-4 text-base">
            <span aria-hidden>{formaterPrix(produit.prix)}</span>
            <span className="sr-only">{prixAccessible(produit.prix)}</span>
          </p>

          {produit.resume && (
            <p className="texte-equilibre mt-5 max-w-[52ch] text-gris">
              {produit.resume}
            </p>
          )}

          <div className="mt-8">
            <AjoutPanier produit={produit} />
          </div>

          {/* --------------------------------------------------- details */}
          <div className="mt-10 border-t border-filet">
            {produit.description && (
              <Bloc titre="Description">
                <div className="space-y-3 text-gris">
                  {produit.description
                    .split('\n\n')
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="texte-equilibre">
                        {para}
                      </p>
                    ))}
                </div>
              </Bloc>
            )}

            <Bloc titre="Livraison & retours">
              <ul className="divide-y divide-filet">
                {LIVRAISONS.map((l) => (
                  <li key={l.nom} className="flex items-baseline justify-between gap-4 py-2.5">
                    <div>
                      <p className="label-xs">{l.nom}</p>
                      <p className="label-xs mt-0.5 text-gris">{l.delai}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="label-xs">{l.prix}</p>
                      <p className="label-xs mt-0.5 text-gris">
                        des {SEUIL_FRANCO / 100} EUR : {l.prixFranco}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="label-xs mt-3 text-gris">{EXPEDITION}</p>
              {!RETRAIT_MAGASIN.disponible && (
                <p className="label-xs mt-1.5 text-gris">{RETRAIT_MAGASIN.mention}</p>
              )}
            </Bloc>

            <Bloc titre="Paiement">
              <ul className="space-y-1.5">
                {PAIEMENTS.map((p) => (
                  <li key={p} className="label-xs text-gris">
                    {p}
                  </li>
                ))}
              </ul>
              <p className="label-xs mt-3 text-gris">{SECURITE_PAIEMENT}</p>
            </Bloc>

            {produit.sku && (
              <p className="label-xs py-4 text-gris/70">Reference {produit.sku}</p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ recommandations */}
      {similaires.length > 0 && (
        <section className="mt-24 md:mt-36">
          <h2 className="serif mb-8 text-[clamp(1.7rem,4vw,2.6rem)] leading-none">
            A decouvrir aussi
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
            {similaires.map((p, i) => (
              <CarteProduit
                key={p.id}
                produit={versCarte(p)}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* ========================================================================== */

/** Bloc depliable natif : accessible au clavier sans une ligne de script. */
function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-filet">
      <summary className="label flex cursor-pointer list-none items-center justify-between py-4 transition-opacity hover:opacity-60 [&::-webkit-details-marker]:hidden">
        {titre}
        <span
          aria-hidden
          className="text-base leading-none transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
