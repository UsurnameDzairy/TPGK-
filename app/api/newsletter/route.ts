import { NextResponse } from 'next/server';

/**
 * Inscription a la newsletter.
 *
 * Cette route ne pretend jamais avoir enregistre une adresse qu'elle n'a pas
 * transmise. Deux cas, et deux seulement :
 *
 *  1. `NEWSLETTER_WEBHOOK_URL` est defini — l'adresse est reellement envoyee
 *     au service d'emailing (Brevo, Mailchimp, Zapier, une automatisation
 *     maison…). On ne confirme au visiteur que si ce service a repondu OK.
 *
 *  2. La variable est absente — on repond 503 avec un message explicite.
 *     L'interface affiche alors « service indisponible » et propose le canal
 *     de contact officiel. Afficher « merci, vous etes inscrite » sans que
 *     rien ne parte ferait perdre l'adresse ET la confiance de la cliente.
 *
 * Le code de reduction suit la meme regle : il n'est communique que s'il
 * existe reellement, c'est-a-dire s'il a ete cree dans WooCommerce et
 * renseigne dans `NEWSLETTER_CODE_PROMO`. Annoncer une remise qui serait
 * refusee a l'encaissement est le pire moment pour decevoir une cliente.
 */

export const runtime = 'nodejs';

/** Validation volontairement simple : le service d'emailing revalidera. */
function emailPlausible(valeur: unknown): valeur is string {
  return (
    typeof valeur === 'string' &&
    valeur.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur)
  );
}

export async function POST(requete: Request) {
  let corps: unknown;
  try {
    corps = await requete.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Requete illisible.' },
      { status: 400 }
    );
  }

  const email = (corps as { email?: unknown })?.email;

  if (!emailPlausible(email)) {
    return NextResponse.json(
      { ok: false, message: 'Cette adresse e-mail ne semble pas valide.' },
      { status: 422 }
    );
  }

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;

  if (!webhook) {
    return NextResponse.json(
      {
        ok: false,
        motif: 'non-configure',
        message:
          'Les inscriptions ne sont pas encore ouvertes. Ecrivez-nous, nous vous ajouterons a la liste.',
      },
      { status: 503 }
    );
  }

  try {
    const reponse = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'site-tpgk', date: new Date().toISOString() }),
    });

    if (!reponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: 'L’inscription n’a pas pu aboutir. Merci de reessayer plus tard.',
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'L’inscription n’a pas pu aboutir. Merci de reessayer plus tard.',
      },
      { status: 502 }
    );
  }

  // Le code n'est renvoye que s'il existe vraiment cote boutique.
  const code = process.env.NEWSLETTER_CODE_PROMO || null;

  return NextResponse.json({
    ok: true,
    code,
    message: code
      ? 'Merci — votre code de bienvenue est ci-dessous.'
      : 'Merci, votre inscription est enregistree.',
  });
}
