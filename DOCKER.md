# 🐳 Guía de Docker para Desarrollo y Producción

## 📋 Resumen

Este proyecto tiene **dos configuraciones de Docker**:

| Modo | Archivo | Hot-Reload | Rebuild necesario | Uso |
|------|---------|------------|-------------------|-----|
| **Desarrollo** | `docker-compose.yml` + `Dockerfile.dev` | ✅ Sí | ❌ No | Desarrollo local |
| **Producción** | `docker-compose.prod.yml` + `Dockerfile` | ❌ No | ✅ Sí | Deploy/CI/CD |

---

## 🚀 Modo Desarrollo (Recomendado para trabajar)

### Características:
- ✅ **Hot-reload automático**: Los cambios en el código se reflejan instantáneamente
- ✅ **Sin rebuild**: No necesitas reconstruir el contenedor cada vez
- ✅ **Volúmenes sincronizados**: Tu código local se monta en el contenedor
- ✅ **Logs en tiempo real**: Ves los errores inmediatamente

### Comandos:

```bash
# 1. Iniciar en modo desarrollo (primera vez)
docker-compose up --build

# 2. Iniciar (después de la primera vez)
docker-compose up

# 3. Iniciar en background
docker-compose up -d

# 4. Ver logs en tiempo real
docker-compose logs -f app

# 5. Detener
docker-compose down

# 6. Reiniciar solo si cambias package.json
docker-compose down
docker-compose up --build
```

### ¿Cuándo hacer rebuild en desarrollo?
Solo cuando:
- ❌ Agregas/eliminas dependencias en `package.json`
- ❌ Cambias variables de entorno en `.env`
- ❌ Modificas `Dockerfile.dev`

**NO necesitas rebuild para:**
- ✅ Cambios en archivos `.ts`
- ✅ Crear nuevos archivos
- ✅ Modificar lógica de negocio

---

## 🏭 Modo Producción

### Características:
- ✅ **Imagen optimizada**: Multi-stage build, solo dependencias de producción
- ✅ **Sin código fuente**: Solo el código compilado (`dist/`)
- ✅ **Menor tamaño**: ~50% más pequeña que la imagen de desarrollo
- ✅ **Seguridad**: Sin devDependencies ni archivos innecesarios

### Comandos:

```bash
# 1. Build y deploy en producción
docker-compose -f docker-compose.prod.yml up --build -d

# 2. Ver logs
docker-compose -f docker-compose.prod.yml logs -f app

# 3. Detener
docker-compose -f docker-compose.prod.yml down

# 4. Rebuild completo (después de cambios)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 🔄 Comparación: Antes vs Después

### ❌ ANTES (Configuración actual comentada)
```yaml
# volumes:
  # - .:/app
```
**Problema**: Cada cambio requería:
```bash
docker-compose down
docker-compose up --build  # ⏱️ 2-5 minutos
```

### ✅ DESPUÉS (Nueva configuración)
```yaml
volumes:
  - .:/app
  - /app/node_modules
```
**Solución**: Los cambios se reflejan automáticamente:
```bash
# Editas un archivo .ts
# ⚡ Hot-reload automático en ~2 segundos
```

---

## 📊 Flujo de Trabajo Recomendado

### Durante el desarrollo:
```bash
# 1. Primera vez del día
docker-compose up

# 2. Trabajas normalmente, los cambios se reflejan automáticamente
# Editas archivos, guardas, ves cambios en tiempo real

# 3. Si instalas una nueva dependencia
pnpm install nueva-dependencia
docker-compose restart app  # Solo restart, no rebuild

# 4. Al terminar
docker-compose down
```

### Para deploy a producción:
```bash
# 1. Build de producción
docker-compose -f docker-compose.prod.yml build

# 2. Test local de la imagen de producción
docker-compose -f docker-compose.prod.yml up

# 3. Push a registry (opcional)
docker tag app:latest tu-registry/app:latest
docker push tu-registry/app:latest
```

---

## 🐛 Troubleshooting

### Problema: "Los cambios no se reflejan"
```bash
# Solución 1: Verificar que los volúmenes estén activos
docker-compose config

# Solución 2: Reiniciar el contenedor
docker-compose restart app

# Solución 3: Rebuild completo
docker-compose down -v
docker-compose up --build
```

### Problema: "Error de permisos en node_modules"
```bash
# Solución: Limpiar volúmenes
docker-compose down -v
docker-compose up --build
```

### Problema: "El contenedor se detiene inmediatamente"
```bash
# Ver logs para identificar el error
docker-compose logs app

# Verificar que start:dev existe en package.json
cat package.json | grep start:dev
```

---

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz:

```bash
# Modo (development o production)
NODE_ENV=development

# Dockerfile a usar (Dockerfile.dev o Dockerfile)
DOCKERFILE=Dockerfile.dev

# Puerto
PORT=3600

# Tus otras variables...
GOOGLE_API_KEY=tu_api_key
WHATSAPP_TOKEN_MESSAGE=tu_token
```

---

## 🎯 Resumen Rápido

| Acción | Comando |
|--------|---------|
| Desarrollo (primera vez) | `docker-compose up --build` |
| Desarrollo (día a día) | `docker-compose up` |
| Ver logs | `docker-compose logs -f app` |
| Detener | `docker-compose down` |
| Producción | `docker-compose -f docker-compose.prod.yml up --build -d` |

---

## ✅ Ventajas de esta configuración

1. **Velocidad**: Cambios instantáneos sin rebuild
2. **Productividad**: Flujo de trabajo similar a desarrollo sin Docker
3. **Flexibilidad**: Fácil cambio entre desarrollo y producción
4. **Optimización**: Imágenes separadas para cada entorno
5. **Debugging**: Logs en tiempo real y hot-reload

¿Preguntas? Revisa los logs con `docker-compose logs -f app`
