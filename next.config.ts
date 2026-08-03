import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /**
     * Next 16 restreint par defaut `qualities` a [75]. Sur des photos de mode,
     * cette recompression s'ajoutait a celle de l'import : les tissus
     * perdaient leur grain et les aplats se marbraient. On autorise donc une
     * qualite haute, utilisee explicitement sur les visuels produit.
     */
    qualities: [75, 90, 100],

    /** AVIF en premier : meilleur rendu a poids egal sur les photos. */
    formats: ['image/avif', 'image/webp'],

    /**
     * Largeurs servies. Les visuels produit sont en 9:16 et occupent souvent
     * une demi-colonne : on garde des paliers resserres dans les tailles
     * courantes pour eviter de servir du 1920 la ou 640 suffit.
     */
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1440, 1920],
    imageSizes: [128, 200, 256, 320, 384],
  },
};

export default nextConfig;
