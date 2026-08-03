'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import type { Image as ImageProduit } from '@/lib/catalogue';

type Props = {
  images: ImageProduit[];
  nom: string;
};

/**
 * Galerie de la fiche produit.
 *
 * Desktop : les visuels s'empilent en colonne, on parcourt la piece en
 * defilant. Mobile : carrousel horizontal a accroche, avec pastilles de
 * position.
 *
 * Le clic ouvre un agrandissement plein ecran ou la photo est zoomee au
 * pointeur — le detail d'une dentelle ou d'un tissu doit pouvoir s'inspecter.
 */
export default function GalerieProduit({ images, nom }: Props) {
  const [agrandie, setAgrandie] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const pisteRef = useRef<HTMLDivElement>(null);

  /* --------------------------------------------- suivi du visuel courant */
  useEffect(() => {
    const piste = pisteRef.current;
    if (!piste) return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { root: piste, threshold: 0.55 }
    );

    piste.querySelectorAll('[data-index]').forEach((el) => observateur.observe(el));
    return () => observateur.disconnect();
  }, [images.length]);

  /* -------------------------------------------------- clavier sur la loupe */
  useEffect(() => {
    if (agrandie === null) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAgrandie(null);
      if (e.key === 'ArrowRight') setAgrandie((i) => Math.min((i ?? 0) + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setAgrandie((i) => Math.max((i ?? 0) - 1, 0));
    };
    window.addEventListener('keydown', surTouche);
    document.documentElement.classList.add('lenis-stopped');
    return () => {
      window.removeEventListener('keydown', surTouche);
      document.documentElement.classList.remove('lenis-stopped');
    };
  }, [agrandie, images.length]);

  return (
    <>
      {/* ------------------------------------------------------- mobile */}
      <div className="lg:hidden">
        <div
          ref={pisteRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              data-index={i}
              type="button"
              onClick={() => setAgrandie(i)}
              className="relative aspect-[9/16] w-[86%] shrink-0 snap-center overflow-hidden bg-lin"
              aria-label={`Agrandir la photo ${i + 1} sur ${images.length}`}
            >
              <Image
                src={img.src}
                alt={i === 0 ? nom : `${nom} — vue ${i + 1}`}
                fill
                sizes="86vw"
                quality={90}
                priority={i === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.src}
                className={[
                  'h-[2px] w-6 transition-colors duration-300',
                  i === active ? 'bg-encre' : 'bg-filet',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------ desktop */}
      <div className="hidden gap-2 lg:grid">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setAgrandie(i)}
            className="relative aspect-[9/16] w-full overflow-hidden bg-lin"
            aria-label={`Agrandir la photo ${i + 1} sur ${images.length}`}
          >
            <Image
              src={img.src}
              alt={i === 0 ? nom : `${nom} — vue ${i + 1}`}
              fill
              sizes="(max-width: 1280px) 55vw, 46vw"
              quality={90}
              priority={i === 0}
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-couture)] hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- loupe */}
      {agrandie !== null && (
        <Loupe
          image={images[agrandie]}
          nom={nom}
          position={agrandie}
          total={images.length}
          onFermer={() => setAgrandie(null)}
          onPrecedent={() => setAgrandie((i) => Math.max((i ?? 0) - 1, 0))}
          onSuivant={() =>
            setAgrandie((i) => Math.min((i ?? 0) + 1, images.length - 1))
          }
        />
      )}
    </>
  );
}

/* ========================================================================== */

function Loupe({
  image,
  nom,
  position,
  total,
  onFermer,
  onPrecedent,
  onSuivant,
}: {
  image: ImageProduit;
  nom: string;
  position: number;
  total: number;
  onFermer: () => void;
  onPrecedent: () => void;
  onSuivant: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [origine, setOrigine] = useState('50% 50%');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${nom}, photo ${position + 1} sur ${total}`}
      className="fixed inset-0 z-[110] flex flex-col bg-blanc"
    >
      <div className="flex items-center justify-between border-b border-filet px-4 py-3">
        <p className="label-xs text-gris">
          {position + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onFermer}
          autoFocus
          className="label transition-opacity hover:opacity-60"
        >
          Fermer
        </button>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigine(
            `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
          );
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => !z)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={zoom ? 'Reduire la photo' : 'Zoomer sur la photo'}
        >
          <Image
            src={image.src}
            alt={`${nom} — vue ${position + 1}`}
            fill
            sizes="100vw"
            quality={90}
            className="object-contain transition-transform duration-500 ease-[var(--ease-couture)]"
            style={{
              transform: zoom ? 'scale(2.1)' : 'scale(1)',
              transformOrigin: origine,
            }}
          />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 border-t border-filet px-4 py-3">
        <button
          type="button"
          onClick={onPrecedent}
          disabled={position === 0}
          className="label transition-opacity hover:opacity-60 disabled:opacity-25"
        >
          Precedent
        </button>
        <button
          type="button"
          onClick={onSuivant}
          disabled={position === total - 1}
          className="label transition-opacity hover:opacity-60 disabled:opacity-25"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
