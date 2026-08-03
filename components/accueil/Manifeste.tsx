'use client';

import { useRef } from 'react';
import { useReveal } from '@/lib/animation';

type Props = {
  titre: string;
  texte: string;
};

/**
 * Bloc manifeste.
 *
 * Un titre en serif capitales tres espacees, un paragraphe court centre, et
 * beaucoup de blanc autour. C'est le seul endroit de la page ou la maison
 * parle en son nom — il doit rester bref pour qu'on le lise vraiment.
 */
export default function Manifeste({ titre, texte }: Props) {
  const zoneRef = useRef<HTMLElement>(null);
  useReveal(zoneRef);

  return (
    <section ref={zoneRef} className="gouttiere py-20 text-center md:py-28">
      <h2
        data-reveal
        className="avant-reveal serif mx-auto max-w-[24ch] text-[clamp(1.15rem,2.6vw,1.85rem)] uppercase leading-[1.35] tracking-[0.16em]"
      >
        {titre}
      </h2>

      <p
        data-reveal
        data-reveal-delai="0.08"
        className="avant-reveal texte-equilibre mx-auto mt-7 max-w-[66ch] text-gris"
      >
        {texte}
      </p>
    </section>
  );
}
