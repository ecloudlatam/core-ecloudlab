#!/bin/bash

echo "🔧 Construyendo imagen Docker para producción..."

docker build \
  --platform linux/amd64 \
  -t edrians/whatsapp-ecommerce:v1 .

echo "🚀 Subiendo imagen a Docker Hub..."

docker push edrians/whatsapp-ecommerce:v1

echo "✅ Imagen creada y publicada con éxito en Docker Hub: edrians/whatsapp-ecommerce:v1"