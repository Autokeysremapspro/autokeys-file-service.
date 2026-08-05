#!/bin/bash
# Ejecuta esto DENTRO de tu repo (autokeys-file-service), antes de copiar
# los archivos de este zip encima. Borra lo que ya no existe en esta
# entrega porque el sistema de créditos/recargas se eliminó.
#
# Uso:
#   cd /ruta/a/tu/repo/autokeys-file-service
#   bash LIMPIAR_ANTES_DE_DESPLEGAR.sh

set -e

paths=(
  "app/comprar-creditos"
  "app/admin/recargas"
  "app/api/recargas"
  "app/api/paypal/capture-order"
  "app/api/paypal/create-order"
  "app/api/paypal/webhook"
  "app/paypal/success"
  "app/paypal/cancel"
  "lib/services/creditos.ts"
  "lib/services/recargas.ts"
)

for p in "${paths[@]}"; do
  if [ -e "$p" ]; then
    git rm -r -q "$p" 2>/dev/null || rm -rf "$p"
    echo "🗑️  Borrado: $p"
  else
    echo "✅ Ya no existía: $p"
  fi
done

echo ""
echo "Listo. Ahora copia el resto de archivos de este zip encima de tu repo,"
echo "revisa 'git status', y haz commit + push."
