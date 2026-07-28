#!/bin/bash

echo "🔧 Construyendo imagen Docker para production..."

docker build \
  --platform linux/amd64 \
  -t edrians/whatsapp-ecommerce:v1 .

echo "✅ Imagen creada: edrians/whatsapp-ecommerce:v1 ."