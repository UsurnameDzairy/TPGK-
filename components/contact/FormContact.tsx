'use client';

import { useState } from 'react';

const SUJETS = [
  'Question sur une piece',
  'Taille et coupe',
  'Commande en cours',
  'Livraison ou retour',
  'Nos boutiques',
  'Autre',
];

type Reponse = {
  ok: boolean;
  message: string;
  champ?: string;
  repli?: 'mailto';
  destinataire?: string;
  sujet?: string;
  corps?: string;
};

/**
 * Formulaire de contact.
 *
 * En cas d'echec de l'envoi automatique, le serveur renvoie le message deja
 * mis en forme et l'interface propose de l'ouvrir dans la messagerie du
 * visiteur. Sa demande n'est jamais perdue, et on ne lui affiche jamais une
 * confirmation qui ne correspond a rien.
 *
 * Le champ « societe » est un piege a robots : invisible et hors du parcours
 * clavier, un humain ne le remplit pas.
 */
export default function FormContact() {
  const [envoi, setEnvoi] = useState(false);
  const [reponse, setReponse] = useState<Reponse | null>(null);
  const [donnees, setDonnees] = useState({
    nom: '',
    email: '',
    sujet: SUJETS[0],
    message: '',
    societe: '',
  });

  const modifier = (champ: keyof typeof donnees) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setDonnees((d) => ({ ...d, [champ]: e.target.value }));

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setReponse(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      setReponse(await res.json());
    } catch {
      setReponse({
        ok: false,
        message: 'Connexion impossible. Merci de reessayer dans un instant.',
      });
    } finally {
      setEnvoi(false);
    }
  }

  function ouvrirMessagerie() {
    if (!reponse?.destinataire) return;
    const url =
      `mailto:${reponse.destinataire}` +
      `?subject=${encodeURIComponent(reponse.sujet ?? '')}` +
      `&body=${encodeURIComponent(reponse.corps ?? '')}`;
    window.location.href = url;
  }

  /* ------------------------------------------------------------- succes */
  if (reponse?.ok) {
    return (
      <div role="status" className="border border-filet p-8 text-center">
        <p className="serif text-[1.3rem] tracking-[0.1em]">Message envoye</p>
        <p className="mt-4 text-gris">{reponse.message}</p>
      </div>
    );
  }

  const champEnErreur = reponse?.champ;

  return (
    <form onSubmit={soumettre} noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className="label-xs mb-2 block text-gris">
            Nom
          </label>
          <input
            id="nom"
            required
            value={donnees.nom}
            onChange={modifier('nom')}
            aria-invalid={champEnErreur === 'nom'}
            className="w-full border-b border-encre bg-transparent py-2.5 outline-none focus-visible:border-b-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="label-xs mb-2 block text-gris">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={donnees.email}
            onChange={modifier('email')}
            aria-invalid={champEnErreur === 'email'}
            className="w-full border-b border-encre bg-transparent py-2.5 outline-none focus-visible:border-b-2"
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="sujet" className="label-xs mb-2 block text-gris">
          Sujet
        </label>
        <select
          id="sujet"
          value={donnees.sujet}
          onChange={modifier('sujet')}
          className="w-full cursor-pointer border-b border-encre bg-transparent py-2.5 outline-none focus-visible:border-b-2"
        >
          {SUJETS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label htmlFor="message" className="label-xs mb-2 block text-gris">
          Votre message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={donnees.message}
          onChange={modifier('message')}
          aria-invalid={champEnErreur === 'message'}
          className="w-full resize-y border-b border-encre bg-transparent py-2.5 outline-none focus-visible:border-b-2"
        />
      </div>

      {/* Piege a robots : hors du flux visuel et hors du parcours clavier. */}
      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="societe">Societe</label>
        <input
          id="societe"
          tabIndex={-1}
          autoComplete="off"
          value={donnees.societe}
          onChange={modifier('societe')}
        />
      </div>

      {reponse && !reponse.ok && (
        <div role="alert" className="mt-6 border border-filet bg-lin p-4">
          <p className="mb-3 text-encre">{reponse.message}</p>
          {reponse.repli === 'mailto' && (
            <button
              type="button"
              onClick={ouvrirMessagerie}
              className="label border-b border-encre pb-1 transition-opacity hover:opacity-55"
            >
              Ouvrir dans ma messagerie
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={envoi}
        className="label mt-8 w-full bg-encre px-6 py-4 text-blanc transition-opacity hover:opacity-85 disabled:opacity-45 sm:w-auto sm:px-12"
      >
        {envoi ? 'Envoi…' : 'Envoyer'}
      </button>

      <p className="label-xs mt-4 text-gris">
        Vos coordonnees servent uniquement a repondre a votre demande.
      </p>
    </form>
  );
}
