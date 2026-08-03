/**
 * Bandeau de confidentialite affiche sur les preversions.
 *
 * PORTEE REELLE — a ne pas se raconter d'histoires :
 * ce bandeau est une NOTIFICATION, pas un verrou. Un site accessible
 * publiquement ne peut pas etre protege techniquement contre la copie : tout
 * ce que le navigateur affiche a deja ete telecharge chez le visiteur.
 * Desactiver le clic droit ou la selection ne fait que gener les visiteurs
 * legitimes, sans arreter quiconque sait ouvrir les outils de developpement.
 *
 * Ce qu'il apporte vraiment :
 *  - il etablit que le visiteur a ete informe du caractere confidentiel et du
 *    droit de propriete, ce qui compte en cas de litige ;
 *  - il dissuade la reprise « par commodite » ;
 *  - couple au `noindex` pose dans le layout, il evite que la preversion
 *    circule hors du cercle a qui le lien a ete transmis.
 *
 * Pour une VRAIE barriere d'acces, il faut un mot de passe au niveau de
 * l'hebergeur (Vercel : Deployment Protection).
 *
 * A RETIRER a la mise en ligne definitive sur tpgk.fr.
 */
export default function BandeauProtection() {
  return (
    <aside
      role="note"
      aria-label="Mention de confidentialite"
      className="fixed inset-x-0 bottom-0 z-[130] border-t border-white/15 bg-nuit/95 px-4 py-2.5 text-blanc backdrop-blur-sm"
    >
      <p className="label-xs mx-auto max-w-6xl text-center leading-relaxed">
        Preversion confidentielle — © TPGK. Maquette reservee a la maison :
        toute reproduction, diffusion ou reutilisation, totale ou partielle,
        est interdite sans son accord ecrit prealable.
      </p>
    </aside>
  );
}
