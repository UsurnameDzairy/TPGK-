'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const CLE = 'tpgk-newsletter-vue';
const DELAI_AVANT_OUVERTURE = 9000;

/**
 * Invitation a la newsletter.
 *
 * Apparait une fois par visiteur, apres un delai : surgir des la premiere
 * seconde fait fuir avant meme qu'on ait vu une piece.
 *
 * L'avantage de bienvenue n'est annonce que s'il a ete configure
 * (`NEXT_PUBLIC_NEWSLETTER_AVANTAGE`), et le code n'est affiche que si le
 * serveur en renvoie un — c'est-a-dire s'il existe vraiment dans WooCommerce.
 * Promettre une remise qui serait refusee a l'encaissement couterait plus
 * cher qu'une inscription gagnee.
 */
export default function PopupNewsletter({ image }: { image?: string | null }) {
  const [ouvert, setOuvert] = useState(false);
  const [email, setEmail] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<{
    ok: boolean;
    message: string;
    code?: string | null;
  } | null>(null);
  const champRef = useRef<HTMLInputElement>(null);

  const avantage = process.env.NEXT_PUBLIC_NEWSLETTER_AVANTAGE;

  useEffect(() => {
    if (localStorage.getItem(CLE) === '1') return;
    const t = window.setTimeout(() => setOuvert(true), DELAI_AVANT_OUVERTURE);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    champRef.current?.focus();
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [ouvert]);

  function fermer() {
    localStorage.setItem(CLE, '1');
    setOuvert(false);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setResultat(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResultat({ ok: Boolean(data.ok), message: data.message, code: data.code });
      if (data.ok) localStorage.setItem(CLE, '1');
    } catch {
      setResultat({
        ok: false,
        message: 'Connexion impossible. Merci de reessayer.',
      });
    } finally {
      setEnvoi(false);
    }
  }

  if (!ouvert) return null;

  return (
    <>
      <div
        onClick={fermer}
        aria-hidden
        className="fixed inset-0 z-[126] bg-nuit/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-newsletter"
        className="fixed left-1/2 top-1/2 z-[127] w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 bg-blanc"
      >
        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer"
          className="label absolute right-4 top-4 z-10 transition-opacity hover:opacity-55"
        >
          Fermer
        </button>

        <div className="grid sm:grid-cols-2">
          {image && (
            <div className="relative hidden aspect-[3/4] bg-lin sm:block">
              <Image
                src={image}
                alt=""
                fill
                sizes="23rem"
                quality={90}
                className="object-cover object-[center_18%]"
              />
            </div>
          )}

          <div className="flex flex-col justify-center p-7 md:p-9">
            <p className="label-xs mb-4 text-gris">La maison TPGK</p>

            <h2
              id="titre-newsletter"
              className="serif text-[clamp(1.25rem,2.6vw,1.7rem)] uppercase leading-[1.3] tracking-[0.13em]"
            >
              Les nouveautes en avant-premiere
            </h2>

            <p className="mt-4 text-gris">
              Nos arrivages, nos collections et nos rendez-vous en boutique.
              {avantage ? ` ${avantage}` : ''}
            </p>

            {resultat?.ok ? (
              <div className="mt-6" role="status">
                <p className="label mb-2">{resultat.message}</p>
                {resultat.code && (
                  <p className="serif border border-encre px-4 py-3 text-center text-lg tracking-[0.2em]">
                    {resultat.code}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={soumettre} className="mt-6">
                <label htmlFor="email-newsletter" className="sr-only">
                  Votre adresse e-mail
                </label>
                <div className="flex items-center border-b border-encre">
                  <input
                    ref={champRef}
                    id="email-newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    className="w-full bg-transparent py-2.5 outline-none placeholder:text-gris"
                  />
                  <button
                    type="submit"
                    disabled={envoi}
                    className="label shrink-0 pl-3 transition-opacity hover:opacity-55 disabled:opacity-40"
                  >
                    {envoi ? '…' : 'Je m’inscris'}
                  </button>
                </div>

                {resultat && !resultat.ok && (
                  <p role="alert" className="mt-3 text-rose-sourd">
                    {resultat.message}{' '}
                    <a
                      href="https://tpgk.fr/contact/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      Nous ecrire
                    </a>
                  </p>
                )}

                <p className="label-xs mt-4 text-gris">
                  Desinscription possible a tout moment.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
