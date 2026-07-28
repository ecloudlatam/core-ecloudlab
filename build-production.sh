#!/bin/bash

echo "🔧 Construyendo y subiendo imagen Docker para production..."

docker buildx build \
  --platform linux/amd64 \
  --push \
  -t edrians/whatsapp-ecommerce:v1 .

echo "✅ Imagen creada y publicada en Docker Hub: edrians/whatsapp-ecommerce:v1"