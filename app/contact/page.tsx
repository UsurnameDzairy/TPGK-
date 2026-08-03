import type { Metadata } from 'next';
import Link from 'next/link';

import FormContact from '@/components/contact/FormContact';
import { BOUTIQUES } from '@/lib/maison';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Ecrire a TPGK pour une question sur une piece, une taille ou une commande. Trois boutiques sur la Cote d’Azur.',
};

/**
 * Page contact.
 *
 * Le formulaire ecrit a contact@tpgk.fr — l'adresse publiee par la maison sur
 * ses mentions legales et ses CGV.
 *
 * La version precedente se contentait de renvoyer vers /contact/ de tpgk.fr,
 * qui n'affiche en realite qu'un formulaire de connexion WooCommerce : le
 * visiteur y arrivait devant une demande d'identifiants au lieu d'un champ
 * de message.
 */
export default function PageContact() {
  return (
    <main className="gouttiere mx-auto max-w-5xl pb-24 pt-28 md:pt-32">
      <header className="mb-12 text-center md:mb-16">
        <h1 className="serif text-[clamp(1.35rem,2.6vw,1.85rem)] uppercase tracking-[0.16em]">
          Nous ecrire
        </h1>
        <p className="texte-equilibre mx-auto mt-4 max-w-[52ch] text-gris">
          Une question sur une piece, une taille ou une commande en cours ?
          L’equipe repond sous un jour ouvre.
        </p>
      </header>

      <div className="grid gap-14 md:grid-cols-[1.35fr_1fr] md:gap-16">
        <FormContact />

        <aside className="space-y-10">
          <div>
            <h2 className="label-xs mb-4 text-gris">Nos boutiques</h2>
            <ul className="space-y-1.5">
              {BOUTIQUES.map((b) => (
                <li key={b.ville} className="produit-nom">
                  {b.ville}
                  {b.precision ? ` — ${b.precision}` : ''}
                </li>
              ))}
            </ul>
            <p className="label-xs mt-3 text-gris">
              Adresses et horaires communiques sur demande.
            </p>
          </div>

          <div>
            <h2 className="label-xs mb-4 text-gris">Avant d’ecrire</h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/guide-des-tailles" className="label lien-file">
                  Guide des tailles
                </Link>
              </li>
              <li>
                <Link href="/livraison-retours" className="label lien-file">
                  Livraison, retours et paiement
                </Link>
              </li>
              <li>
                <a
                  href="https://tpgk.fr/order-track/"
                  target="_blank"
                  rel="noreferrer"
                  className="label lien-file"
                >
                  Suivre ma commande
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="label-xs mb-4 text-gris">Par e-mail</h2>
            <a
              href="mailto:contact@tpgk.fr"
              className="label lien-file"
            >
              contact@tpgk.fr
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
