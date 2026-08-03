import Link from 'next/link';
import FormNewsletter from './FormNewsletter';
import type { Categorie } from '@/lib/catalogue';

const AIDE = [
  { nom: 'La maison', href: '/maison' },
  { nom: 'Livraison & retours', href: '/livraison-retours' },
  { nom: 'Guide des tailles', href: '/guide-des-tailles' },
  { nom: 'Contact', href: '/contact' },
];

/**
 * Liens pointant vers les pages legales existantes de tpgk.fr : elles font
 * foi et n'ont pas ete recopiees ici.
 */
const LEGAL = [
  { nom: 'Mentions legales', href: 'https://tpgk.fr/mentions-legales/' },
  { nom: 'CGV', href: 'https://tpgk.fr/conditions-generales-de-ventes/' },
  { nom: 'Confidentialite', href: 'https://tpgk.fr/politique-de-confidentialite/' },
];

/**
 * Pied de page.
 *
 * Le nom de la maison y revient une derniere fois, en tres grand serif et
 * bord a bord : c'est la signature qui referme la page.
 *
 * Le bloc newsletter passe par /api/newsletter, qui ne confirme une
 * inscription que si un service d'emailing l'a reellement acceptee.
 */
export default function Footer({ categories }: { categories: Categorie[] }) {
  return (
    <footer className="border-t border-filet">
      {/* ------------------------------------------------------- colonnes */}
      <div className="gouttiere pb-12 pt-14 md:pb-16 md:pt-20">
        <div className="grid gap-10 md:grid-cols-3">
          <nav aria-label="Collections">
            <p className="label-xs mb-5 text-gris">Collections</p>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/collection/${c.slug}`} className="label lien-file">
                    {c.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Aide">
            <p className="label-xs mb-5 text-gris">Aide</p>
            <ul className="space-y-2.5">
              {AIDE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="label lien-file">
                    {l.nom}
                  </Link>
                </li>
              ))}
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="label lien-file"
                  >
                    {l.nom}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label-xs mb-5 text-gris">La maison</p>
            <p className="texte-equilibre max-w-[30ch] text-gris">
              Enseigne francaise de pret-a-porter feminin depuis plus de dix
              ans. Trois boutiques sur la Cote d’Azur, a Cannes, Antibes –
              Juan-les-Pins et Nice.
            </p>
            <div className="mt-6">

              <p className="label-xs mb-3 text-gris">Newsletter</p>

              <FormNewsletter />

            </div>


            <a
              href="https://tpgk.fr/contact/"
              target="_blank"
              rel="noreferrer"
              className="label mt-5 inline-block border-b border-encre pb-1 transition-opacity hover:opacity-55"
            >
              Nous ecrire
            </a>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ signature */}
      {/* Bord a bord et volontairement demesure : le mot occupe toute la
          largeur de la fenetre, comme un tampon appose en fin de page. */}
      <div aria-hidden className="overflow-hidden px-1">
        {/* Quatre lettres seulement : il faut un corps tres large et un
            interlettrage serre pour que le mot atteigne les deux bords. */}
        <p className="serif w-full whitespace-nowrap text-center text-[28.5vw] leading-[0.76] tracking-[-0.005em]">
          TPGK
        </p>
      </div>

      <div className="gouttiere flex flex-col gap-2 border-t border-filet py-5 md:flex-row md:items-center md:justify-between">
        <p className="label-xs text-gris">
          © {new Date().getFullYear()} TPGK — Tous droits reserves
        </p>
        <p className="label-xs text-gris">Paiement securise sur tpgk.fr</p>
      </div>
    </footer>
  );
}
