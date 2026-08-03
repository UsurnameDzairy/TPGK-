import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Poppins } from 'next/font/google';
import './globals.css';

import Chrome from '@/components/chrome/Chrome';
import { categoriesNav } from '@/lib/catalogue';

/**
 * Serif Didone : le nom de la maison et les grands mots editoriaux.
 * Usage volontairement rare — c'est ce qui lui donne son poids.
 */
const serif = Bodoni_Moda({
  variable: '--police-serif',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Sans geometrique : toute l'interface, en petits corps espaces.
 * Un seul caractere pour la navigation, les prix et les libelles maintient
 * l'ensemble calme.
 */
const sans = Poppins({
  variable: '--police-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tpgk.fr'),
  title: {
    default: 'TPGK — Boutique de mode femme',
    template: '%s — TPGK',
  },
  description:
    'Robes, tailleurs, ensembles et chaussures selectionnes par TPGK. Maison francaise, trois boutiques sur la Cote d’Azur. Livraison offerte des 50 euros.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'TPGK',
  },

  /**
   * PREVERSION : interdiction d'indexer.
   *
   * Ce site reprend mot pour mot les fiches produit de tpgk.fr. Laisse
   * indexable sur une adresse de preversion, il constituerait un contenu
   * duplique susceptible de faire reculer la boutique reelle dans les
   * resultats de recherche.
   *
   * A RETIRER le jour de la mise en ligne sur tpgk.fr — et seulement ce
   * jour-la.
   */
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a
          href="#contenu"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-encre focus:px-4 focus:py-3 focus:text-blanc"
        >
          Aller au contenu
        </a>
        <Chrome categories={categoriesNav()}>{children}</Chrome>
      </body>
    </html>
  );
}
