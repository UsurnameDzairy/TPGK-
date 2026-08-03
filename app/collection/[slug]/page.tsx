import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import VueCatalogue from '@/components/produit/VueCatalogue';
import {
  categoriesNav,
  categorieParSlug,
  produitsDeCategorie,
  versCarte,
} from '@/lib/catalogue';

type Params = { slug: string };

/** Le catalogue est fige a la generation : toutes les collections sont pre-rendues. */
export function generateStaticParams(): Params[] {
  return categoriesNav().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categorie = categorieParSlug(slug);
  if (!categorie) return { title: 'Collection introuvable' };

  const nombre = produitsDeCategorie(slug).length;
  return {
    title: categorie.nom,
    description: `${nombre} pieces de la collection ${categorie.nom} selectionnees par TPGK.`,
  };
}

export default async function PageCollection({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const categorie = categorieParSlug(slug);
  if (!categorie) notFound();

  const lot = produitsDeCategorie(slug);
  if (lot.length === 0) notFound();

  return (
    <main>
      <VueCatalogue
        titre={categorie.nom}
        chapeau={`${lot.length} piece${lot.length > 1 ? 's' : ''} dans cette collection.`}
        produits={lot.map(versCarte)}
      />
    </main>
  );
}
