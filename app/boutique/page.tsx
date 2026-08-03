import type { Metadata } from 'next';

import VueCatalogue from '@/components/produit/VueCatalogue';
import { produits, versCarte } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Toutes les pieces',
  description:
    'L’integralite de la selection TPGK : robes, tailleurs, ensembles, hauts, pantalons et chaussures.',
};

export default function PageBoutique() {
  return (
    <main>
      <VueCatalogue
        titre="Toutes les pieces"
        chapeau="La selection complete de la maison, robes et tailleurs en tete."
        produits={produits.map(versCarte)}
      />
    </main>
  );
}
