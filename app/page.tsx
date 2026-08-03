import Hero from '@/components/accueil/Hero';
import BlocsVisuels, { type BlocVisuel } from '@/components/accueil/BlocsVisuels';
import BandeEditoriale from '@/components/accueil/BandeEditoriale';
import Selection from '@/components/accueil/Selection';
import Manifeste from '@/components/accueil/Manifeste';
import Lookbook, { type Silhouette } from '@/components/accueil/Lookbook';
import Boutiques from '@/components/accueil/Boutiques';
import ListeCollections from '@/components/accueil/ListeCollections';
import {
  categoriesNav,
  produitsDeCategorie,
  produits,
  versCarte,
  type Produit,
} from '@/lib/catalogue';
import { LIVRAISONS, PAIEMENTS, EXPEDITION } from '@/lib/infos-boutique';

/**
 * Distributeur de visuels.
 *
 * Reserve le PRODUIT, pas seulement la photo. Les categories se chevauchent
 * largement — une meme robe est a la fois « Nouveautes » et « Robes » — et
 * une reservation par image renvoyait deux cliches differents de la meme
 * piece dans deux blocs voisins. A l'ecran, cela se lit comme un doublon.
 *
 * `rang` permet de ne pas toujours retenir la premiere piece disponible,
 * pour varier les silhouettes d'un bloc a l'autre.
 */
function creerDistributeur() {
  const produitsPris = new Set<number>();

  const prendre = (lot: Produit[], rang = 0): Produit | null => {
    const candidats = (lot.length ? lot : produits).filter(
      (p) => !produitsPris.has(p.id) && p.images.length > 0
    );
    const choisi = candidats[Math.min(rang, candidats.length - 1)];
    if (!choisi) return null;
    produitsPris.add(choisi.id);
    return choisi;
  };

  return {
    /** Une image, en reservant la piece. */
    image(lot: Produit[], rang = 0): string {
      const p = prendre(lot, rang);
      if (p) return p.images[0].src;
      const repli = (lot.length ? lot : produits)[0];
      return repli?.images[0]?.src ?? produits[0].images[0].src;
    },
    /** Plusieurs pieces distinctes, pour une bande de silhouettes. */
    serie(lot: Produit[], nombre: number): Produit[] {
      const sortie: Produit[] = [];
      for (let i = 0; i < nombre; i += 1) {
        const p = prendre(lot, 0);
        if (!p) break;
        sortie.push(p);
      }
      return sortie;
    },
  };
}

export default function PageAccueil() {
  const collections = categoriesNav();
  const visuel = creerDistributeur();

  const nouveautes = produitsDeCategorie('nouveautes');
  const robes = produitsDeCategorie('robes');
  const tailleurs = produitsDeCategorie('tailleurs-femme');
  const chaussures = produitsDeCategorie('chaussures');
  const manteaux = produitsDeCategorie('manteaux-veste');
  const ventes = produitsDeCategorie('meilleures-ventes');

  // IMPORTANT : ces appels suivent l'ordre d'apparition a l'ecran. Le
  // distributeur reserve au fil de l'eau, donc l'ordre du code determine qui
  // obtient quelle piece. Les selections produit passent elles aussi par lui :
  // « Nouveautes » et « Meilleures ventes » se recoupent largement, et les
  // afficher directement ramenait les memes silhouettes deux fois.
  const premiereRangee: BlocVisuel[] = [
    { image: visuel.image(nouveautes, 0), titre: 'Automne — Hiver', href: '/collection/nouveautes' },
    { image: visuel.image(robes, 6), titre: 'Robes', href: '/collection/robes' },
  ];

  const selectionNouveautes = visuel.serie(nouveautes, 5);

  const bandeHaute = visuel.image(manteaux, 1);

  const selectionVentes = visuel.serie(ventes, 5);

  const secondeRangee: BlocVisuel[] = [
    { image: visuel.image(tailleurs, 2), titre: 'Tailleurs', href: '/collection/tailleurs-femme' },
    { image: visuel.image(chaussures, 5), titre: 'Chaussures', href: '/collection/chaussures' },
  ];

  const silhouettes: Silhouette[] = visuel.serie(robes, 8).map((p) => ({
    image: p.images[0].src,
    nom: p.nom,
    href: `/produit/${p.slug}`,
  }));

  return (
    <main>
      <Hero />

      <BlocsVisuels blocs={premiereRangee} />

      <Selection
        titre="Nouveautes"
        produits={selectionNouveautes.map(versCarte)}
        lien={{ href: '/collection/nouveautes', nom: 'Voir les nouveautes' }}
      />

      <BandeEditoriale
        image={bandeHaute}
        intitule="Vestiaire d’hiver"
        titre="Des pieces qui traversent les saisons"
        lien={{ href: '/collection/manteaux-veste', nom: 'Manteaux & vestes' }}
      />

      <Selection
        titre="Meilleures ventes"
        produits={selectionVentes.map(versCarte)}
        lien={{ href: '/boutique', nom: 'Voir toute la boutique' }}
      />

      <Manifeste
        titre="L’elegance au quotidien avec TPGK"
        texte="Enseigne francaise de pret-a-porter feminin depuis plus de dix ans, TPGK tient trois boutiques sur la Cote d’Azur, a Cannes, Antibes – Juan-les-Pins et Nice. Notre parti pris : vous faire decouvrir les pieces les plus actuelles pour le vestiaire de tous les jours, en cherchant la meilleure qualite au prix le plus juste."
      />

      <BlocsVisuels blocs={secondeRangee} />

      <Lookbook titre="Le vestiaire en images" silhouettes={silhouettes} />

      <Boutiques />

      <ListeCollections categories={collections} />

      {/* ------------------------------------------------------ reassurance */}
      <section className="gouttiere border-t border-filet py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="label-xs mb-4 text-gris">Livraison</h2>
            <ul className="space-y-1.5">
              {LIVRAISONS.map((l) => (
                <li key={l.nom} className="text-gris">
                  {l.nom} — {l.delai}
                </li>
              ))}
            </ul>
            <p className="mt-3">Mondial Relay offert des 50 EUR</p>
          </div>

          <div>
            <h2 className="label-xs mb-4 text-gris">Paiement</h2>
            <ul className="space-y-1.5">
              {PAIEMENTS.map((p) => (
                <li key={p} className="text-gris">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="label-xs mb-4 text-gris">Expedition</h2>
            <p className="text-gris">{EXPEDITION}</p>
            <p className="mt-3">Stock en France</p>
          </div>
        </div>
      </section>
    </main>
  );
}
