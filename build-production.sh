#!/bin/bash

echo "🔧 Construyendo imagen Docker para production..."

docker build \
  --platform linux/amd64 \
  --load \
  -t edrians/whatsapp-ecommerce:v1 .

echo "✅ Imagen creada y cargada en Docker: edrians/whatsapp-ecommerce:v1"