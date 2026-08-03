'use client';

import { useEffect, useState } from 'react';

import { usePreferences } from '@/lib/consentement';

/**
 * Bandeau de consentement aux traceurs.
 *
 * Trois principes tenus :
 *  - « Refuser » est aussi accessible et aussi visible qu'« Accepter » ;
 *    un refus enfoui dans un sous-menu ne vaut pas consentement libre ;
 *  - le choix est conserve et reellement respecte (voir lib/consentement) ;
 *  - le bandeau ne bloque pas la navigation : le visiteur peut consulter le
 *    site avant de decider, et rien n'est depose entre-temps.
 */
export default function BandeauCookies() {
  const choix = usePreferences((e) => e.choix);
  const accepter = usePreferences((e) => e.accepter);
  const refuser = usePreferences((e) => e.refuser);
  const [monte, setMonte] = useState(false);

  // Le choix vient du stockage local : on n'affiche rien avant montage pour
  // eviter que le bandeau clignote chez qui a deja repondu.
  useEffect(() => setMonte(true), []);

  if (!monte || choix !== 'inconnu') return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Preferences de confidentialite"
      className="fixed bottom-[4.5rem] left-4 z-[125] w-[min(26rem,calc(100vw-2rem))] border border-filet bg-blanc p-5 shadow-[0_8px_40px_rgba(0,0,0,0.1)] md:bottom-[5.5rem]"
    >
      <p className="label-xs mb-3">Confidentialite</p>

      <p className="mb-5 text-gris">
        Ce site n’utilise aucun traceur publicitaire. Nous souhaitons
        simplement mesurer l’audience pour ameliorer la boutique. Vous pouvez
        refuser sans consequence sur votre navigation.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accepter}
          className="label bg-encre px-5 py-3 text-blanc transition-opacity hover:opacity-80"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={refuser}
          className="label border border-filet px-5 py-3 transition-colors hover:border-encre"
        >
          Refuser
        </button>
      </div>

      <a
        href="https://tpgk.fr/politique-relative-aux-cookies/"
        target="_blank"
        rel="noreferrer"
        className="label-xs mt-4 inline-block text-gris underline underline-offset-4 transition-colors hover:text-encre"
      >
        Politique relative aux cookies
      </a>
    </div>
  );
}
