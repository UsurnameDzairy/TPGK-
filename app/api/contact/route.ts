import { NextResponse } from 'next/server';

/**
 * Formulaire de contact.
 *
 * Le message part reellement, ou le visiteur est prevenu. Jamais de
 * confirmation de complaisance : quelqu'un qui croit avoir ecrit et attend
 * une reponse qui ne viendra pas est plus mal servi que s'il n'avait rien
 * envoye.
 *
 * Trois voies, essayees dans l'ordre :
 *   1. `RESEND_API_KEY` — envoi direct vers CONTACT_DESTINATAIRE ;
 *   2. `CONTACT_WEBHOOK_URL` — transmission a une automatisation (Make,
 *      Zapier, n8n…) ;
 *   3. aucune des deux — on repond 503 avec `repli: 'mailto'`, et
 *      l'interface bascule sur un lien `mailto:` pre-rempli. Le message
 *      part alors depuis la messagerie du visiteur : c'est moins confortable,
 *      mais c'est vrai.
 */

export const runtime = 'nodejs';

export const DESTINATAIRE = process.env.CONTACT_DESTINATAIRE ?? 'contact@tpgk.fr';

type Demande = {
  nom?: unknown;
  email?: unknown;
  sujet?: unknown;
  message?: unknown;
  /** Champ piege : rempli uniquement par les robots. */
  societe?: unknown;
};

function texteValide(v: unknown, min: number, max: number): v is string {
  return typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
}

function emailValide(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    v.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
  );
}

export async function POST(requete: Request) {
  let corps: Demande;
  try {
    corps = (await requete.json()) as Demande;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Requete illisible.' },
      { status: 400 }
    );
  }

  // Piege a robots : un humain ne voit pas ce champ, donc ne le remplit pas.
  // On repond 200 sans rien envoyer, pour ne pas renseigner l'automate.
  if (typeof corps.societe === 'string' && corps.societe.trim() !== '') {
    return NextResponse.json({ ok: true, message: 'Merci, message bien recu.' });
  }

  if (!texteValide(corps.nom, 2, 80)) {
    return NextResponse.json(
      { ok: false, champ: 'nom', message: 'Merci d’indiquer votre nom.' },
      { status: 422 }
    );
  }
  if (!emailValide(corps.email)) {
    return NextResponse.json(
      { ok: false, champ: 'email', message: 'Cette adresse e-mail ne semble pas valide.' },
      { status: 422 }
    );
  }
  if (!texteValide(corps.message, 10, 4000)) {
    return NextResponse.json(
      { ok: false, champ: 'message', message: 'Merci de detailler un peu votre demande.' },
      { status: 422 }
    );
  }

  const nom = (corps.nom as string).trim();
  const email = (corps.email as string).trim();
  const sujet = texteValide(corps.sujet, 1, 120)
    ? (corps.sujet as string).trim()
    : 'Message depuis le site';
  const message = (corps.message as string).trim();

  const corpsTexte = [
    `Nom     : ${nom}`,
    `E-mail  : ${email}`,
    `Sujet   : ${sujet}`,
    '',
    message,
  ].join('\n');

  /* ------------------------------------------------- 1. envoi par Resend */
  const cleResend = process.env.RESEND_API_KEY;
  if (cleResend) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleResend}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_EXPEDITEUR ?? 'site@tpgk.fr',
          to: [DESTINATAIRE],
          reply_to: email,
          subject: `[Site] ${sujet}`,
          text: corpsTexte,
        }),
      });
      if (res.ok) {
        return NextResponse.json({
          ok: true,
          message: 'Merci, votre message est parti. Nous revenons vers vous rapidement.',
        });
      }
    } catch {
      /* on tente la voie suivante */
    }
  }

  /* ---------------------------------------------- 2. transmission webhook */
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          email,
          sujet,
          message,
          source: 'site-tpgk',
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        return NextResponse.json({
          ok: true,
          message: 'Merci, votre message est parti. Nous revenons vers vous rapidement.',
        });
      }
    } catch {
      /* on bascule sur le repli */
    }
  }

  /* -------------------------------------------------- 3. repli honnete */
  return NextResponse.json(
    {
      ok: false,
      repli: 'mailto',
      destinataire: DESTINATAIRE,
      sujet: `[Site] ${sujet}`,
      corps: corpsTexte,
      message:
        'L’envoi automatique n’est pas encore active. Votre message a ete prepare : il ne reste qu’a l’envoyer depuis votre messagerie.',
    },
    { status: 503 }
  );
}
