#!/bin/bash
#
# Monte le film de campagne du hero a partir des medias reels de la maison.
#
# Aucune image de synthese : la video du defile TPGK et les photographies du
# catalogue, retravaillees. Les mannequins et les pieces sont les vraies.
#
# Trois partis pris de mise en scene :
#   - le defile est ralenti (x1,7) : la lenteur est le premier signe du luxe ;
#   - les photos verticales sont parcourues par un panoramique descendant
#     plutot que rognees au centre — la camera longe la silhouette au lieu
#     d'en montrer un fragment ;
#   - l'etalonnage reste sobre : contraste en S tres leger, saturation
#     retenue, vignettage doux. Un film de mode se distingue par ce qu'il
#     retire, pas par ce qu'il ajoute.
#
# Usage : bash scripts/monter-film-campagne.sh

set -e

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
MEDIA="$RACINE/public/media"
PHOTOS="$MEDIA/products"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

L=1920
H=1080
FPS=25

# Etalonnage commun a tous les plans : contraste doux, saturation retenue,
# et une legere montee des noirs pour l'aspect argentique.
ETALON="eq=contrast=1.06:saturation=0.92:gamma=1.02,curves=all='0/0.02 0.5/0.5 1/0.98'"
VIGNETTE="vignette=angle=PI/5"

# Le defile disponible montre des tailleurs de velours : une collection
# d'hiver que la maison ne vend plus. Le film est donc bati uniquement sur
# les pieces estivales du catalogue, qui en representent la majorite.
echo "→ Plan 1 : robe imprimee, plan large"


# --- plans photo : panoramique descendant le long de la silhouette ---------
# La photo (1440x2560) est portee a 1920 de large, soit 3413 de haut. On en
# preleve une fenetre 1920x1080 que l'on fait descendre lentement.
plan_photo() {
  local fichier="$1" sortie="$2" duree="$3" depart="$4" arrivee="$5"
  local total=$(( duree * FPS ))
  ffmpeg -v error -y -loop 1 -t "$duree" -i "$PHOTOS/$fichier" \
    -filter_complex "[0:v]scale=${L}:-1,crop=${L}:${H}:0:'${depart}+(${arrivee}-${depart})*t/${duree}',${ETALON},${VIGNETTE},fps=${FPS}[v]" \
    -map "[v]" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p "$sortie"
}

plan_photo "robe-chemise-soie-tencel-imprimee-rouge-1.webp" "$TMP/plan0.mp4" 5 250 1250

echo "→ Plan 2 : maille chevron bleue, remontee"
plan_photo "robe-longue-bleue-maille-chevron-1.webp" "$TMP/plan1.mp4" 5 1300 350

echo "→ Plan 3 : crochet boheme, descente"
plan_photo "robe-crochet-multicolore-boheme-1.webp" "$TMP/plan2.mp4" 5 260 1220

echo "→ Plan 4 : broderie anglaise, remontee"
plan_photo "robe-broderie-anglaise-bleue-coton-1.webp" "$TMP/plan3.mp4" 5 1280 320

echo "→ Assemblage avec fondus enchaines"
# xfade demande des offsets absolus : chaque fondu dure 0,9 s et empiete sur
# le plan precedent, d'ou le decalage cumule.
ffmpeg -v error -y \
  -i "$TMP/plan0.mp4" -i "$TMP/plan1.mp4" -i "$TMP/plan2.mp4" -i "$TMP/plan3.mp4" \
  -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=0.9:offset=4.1[a]; \
[a][2:v]xfade=transition=fade:duration=0.9:offset=8.2[b]; \
[b][3:v]xfade=transition=fade:duration=0.9:offset=12.3[c]; \
[c]fps=${FPS},format=yuv420p[v]" \
  -map "[v]" -an \
  -c:v libx264 -preset slow -crf 21 -movflags +faststart \
  "$MEDIA/campagne-tpgk.mp4"

echo "→ Image de repli (premiere frame du defile, etalonnee)"
ffmpeg -v error -y -ss 2 -i "$MEDIA/campagne-tpgk.mp4" -frames:v 1 -q:v 2 "$TMP/poster.jpg"
node -e "
const sharp=require('$RACINE/node_modules/sharp');
sharp('$TMP/poster.jpg').resize({width:1920}).webp({quality:82})
  .toFile('$MEDIA/campagne-poster.webp')
  .then(i=>console.log('   poster :', i.width+'x'+i.height, Math.round(i.size/1024)+' ko'));
"

echo
echo "──────────────────────────────────────"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height \
  -of default=noprint_wrappers=1 "$MEDIA/campagne-tpgk.mp4"
echo "poids : $(du -h "$MEDIA/campagne-tpgk.mp4" | cut -f1)"
echo "──────────────────────────────────────"
