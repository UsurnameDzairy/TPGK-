# TPGK — vitrine

Front Next.js 16 de la boutique TPGK, pose devant le WooCommerce existant de
`tpgk.fr`. Le catalogue est lu une fois puis fige en local ; l'encaissement
reste assure par la boutique WordPress.

## Demarrer

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # verification de production
```

## Les deux scripts de maintenance

Ils ne font pas partie de l'application et n'apparaissent donc pas dans le
build : ce sont des outils qu'on lance a la main, ponctuellement. S'en passer
reviendrait a refaire leur travail manuellement.

### `npm run catalogue:import`

Recupere le catalogue depuis l'API Store de WooCommerce et l'ecrit dans
`data/catalogue.json`, puis telecharge toutes les photos dans
`public/media/products/` en WebP 1440 px.

**A relancer chaque fois que le catalogue bouge sur tpgk.fr** — nouvelles
pieces, changements de prix, photos remplacees. Sans lui, la vitrine reste
figee sur l'etat du dernier import.

Le script est idempotent (une image deja presente n'est pas retelechargee) et
sort en code 1 si une image echoue, pour qu'un import partiel ne passe jamais
pour un import reussi.

### `npm run film:monter`

Remonte le film du hero (`public/media/campagne-tpgk.mp4`) a partir des photos
du catalogue : panoramiques lents le long des silhouettes, etalonnage sobre,
fondus enchaines.

**A relancer au changement de collection**, en editant la liste des plans dans
`scripts/monter-film-campagne.sh`. Necessite `ffmpeg`.

## Structure

```
app/                pages (App Router) et route API newsletter
components/
  chrome/           en-tete, menu, panier, pied de page, ecran d'entree
  accueil/          sections de la page d'accueil
  produit/          carte, grille, galerie, ajout au panier
lib/
  catalogue.ts      acces au catalogue (importe le JSON — serveur uniquement)
  format.ts         formatage des prix (client + serveur)
  panier.ts         etat du panier (persiste)
  woo.ts            transfert du panier vers WooCommerce
  infos-boutique.ts livraison, paiement, tailles — donnees reelles de tpgk.fr
  maison.ts         histoire de la maison, boutiques
data/catalogue.json genere par catalogue:import — ne pas editer a la main
```

## Points de vigilance

- **`lib/catalogue.ts` importe le JSON complet** : ne jamais l'importer depuis
  un composant client, sinon les 160 produits partent dans le bundle
  navigateur. Les composants client passent par `lib/format.ts`.
- **Le paiement** part vers `tpgk.fr`. La reprise du panier depend du cookie de
  session WooCommerce : fiable depuis tpgk.fr ou un sous-domaine, bloquee
  depuis un domaine tiers (cookies inter-sites).
- **`robots: noindex`** est actif dans `app/layout.tsx` tant que le site est en
  preversion. **A retirer le jour de la mise en ligne sur tpgk.fr.**
- **Le bandeau de confidentialite** (`BandeauProtection`) est lui aussi a
  retirer a la mise en ligne definitive.
- **`.DS_Store`** : le projet vit sur le Bureau, macOS y recree ces fichiers en
  continu. Si `rm -rf .next` echoue (« Directory not empty »), Next repart d'un
  cache partiel et sert une page perimee. Utiliser
  `mv .next .next-old && rm -rf .next-old`.

## Newsletter

`app/api/newsletter/route.ts` ne confirme une inscription que si un service
d'emailing l'a reellement acceptee. Variables attendues :

| Variable | Role |
| --- | --- |
| `NEWSLETTER_WEBHOOK_URL` | point d'envoi (Brevo, Mailchimp, Zapier…) |
| `NEWSLETTER_CODE_PROMO` | code de bienvenue — **doit exister dans WooCommerce** |
| `NEXT_PUBLIC_NEWSLETTER_AVANTAGE` | phrase d'accroche de l'offre |

Sans ces variables, le site ne promet rien : ni inscription fantome, ni remise
inexistante.
