import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contacter l’equipe TPGK pour une question sur une piece, une taille ou une commande.',
};

/**
 * Pas de formulaire ici.
 *
 * Un formulaire sans service d'envoi affiche « message envoye » sans que rien
 * ne parte : c'est un faux succes, et le client perd sa demande. Tant qu'aucun
 * point d'envoi n'est branche, on renvoie vers le canal officiel de la
 * boutique, qui fonctionne reellement.
 */
export default function PageContact() {
  return (
    <main className="gouttiere mx-auto max-w-4xl pb-24 pt-28 md:pt-36">
      <h1 className="serif text-[clamp(2.4rem,8vw,5.5rem)] leading-[0.9]">
        Contact
      </h1>

      <p className="texte-equilibre mt-5 max-w-[50ch] text-gris">
        Une question sur une piece, une taille, une commande en cours ? L’equipe
        TPGK repond depuis la boutique.
      </p>

      <div className="mt-12 grid gap-8 border-t border-filet pt-10 md:grid-cols-2">
        <div>
          <h2 className="label mb-3">Ecrire a la boutique</h2>
          <p className="texte-equilibre mb-5 text-gris">
            Le formulaire officiel de TPGK transmet directement votre demande a
            l’equipe.
          </p>
          <a
            href="https://tpgk.fr/contact/"
            target="_blank"
            rel="noreferrer"
            className="label inline-block border-b border-encre pb-1 transition-opacity hover:opacity-60"
          >
            Ouvrir le formulaire TPGK
          </a>
        </div>

        <div>
          <h2 className="label mb-3">Avant d’ecrire</h2>
          <ul className="space-y-2.5">
            <li>
              <Link href="/guide-des-tailles" className="label-xs lien-file">
                Guide des tailles
              </Link>
            </li>
            <li>
              <Link href="/livraison-retours" className="label-xs lien-file">
                Livraison, retours et paiement
              </Link>
            </li>
            <li>
              <a
                href="https://tpgk.fr/aide-q-a/"
                target="_blank"
                rel="noreferrer"
                className="label-xs lien-file"
              >
                Questions frequentes
              </a>
            </li>
            <li>
              <a
                href="https://tpgk.fr/order-track/"
                target="_blank"
                rel="noreferrer"
                className="label-xs lien-file"
              >
                Suivre ma commande
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
