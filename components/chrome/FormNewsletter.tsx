'use client';

import { useState } from 'react';

/**
 * Formulaire d'inscription compact, pour le pied de page.
 *
 * Meme regle que le pop-up : on n'affiche une confirmation que si le serveur
 * a reellement transmis l'adresse. En cas d'echec, le message d'erreur reel
 * est montre et le canal de contact officiel prend le relais.
 */
export default function FormNewsletter() {
  const [email, setEmail] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<{
    ok: boolean;
    message: string;
    code?: string | null;
  } | null>(null);

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
    } catch {
      setResultat({ ok: false, message: 'Connexion impossible. Merci de reessayer.' });
    } finally {
      setEnvoi(false);
    }
  }

  if (resultat?.ok) {
    return (
      <div role="status">
        <p className="label mb-2">{resultat.message}</p>
        {resultat.code && (
          <p className="serif border border-encre px-4 py-2.5 text-center tracking-[0.2em]">
            {resultat.code}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={soumettre}>
      <label htmlFor="email-pied" className="sr-only">
        Votre adresse e-mail
      </label>
      <div className="flex items-center border-b border-encre">
        <input
          id="email-pied"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className="w-full bg-transparent py-2 outline-none placeholder:text-gris"
        />
        <button
          type="submit"
          disabled={envoi}
          className="label shrink-0 pl-3 transition-opacity hover:opacity-55 disabled:opacity-40"
          aria-label="S’inscrire a la newsletter"
        >
          {envoi ? '…' : '→'}
        </button>
      </div>

      {resultat && !resultat.ok && (
        <p role="alert" className="mt-2.5 text-rose-sourd">
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
    </form>
  );
}
