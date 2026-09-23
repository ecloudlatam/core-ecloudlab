# 🚀 Core eCloudLab

> Núcleo de servicios y lógica de negocio para la plataforma eCloudLab.

Desarrollado en **TypeScript**, este repositorio centraliza la arquitectura modular para la gestión de productos, emisión inteligente de cotizaciones, trazabilidad mediante códigos QR y capas de seguridad para autorizaciones de inventario.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de Trabajo y Contribución](#-flujo-de-trabajo-y-contribución)
- [Licencia](#-licencia)

---

## ✨ Características Principales

1. **📄 Cotizaciones Rápidas y Automatizadas:**
   - Búsqueda y selección ágil de productos dentro del catálogo.
   - Generación de cotizaciones dinámicas y envío a clientes vía WhatsApp.
   - Historial y seguimiento de estados de cotización.

2. **⚙️ Gestión y Catálogo de Productos:**
   - Carga masiva y actualización continua de inventario.
   - Reglas de negocio y cálculo automatizado de precios y márgenes.

3. **📍 Trazabilidad y Seguimiento con QR:**
   - Generación de códigos QR únicos para trazabilidad de existencias.
   - Registro de movimientos, ubicación y estado en tiempo real.

4. **🔒 Seguridad y Control de Autorizaciones:**
   - Flujos de validación para transferencias de productos mediante OTP y verificación facial.
   - Control de roles y permisos jerárquicos (control parental / supervisión comercial).

5. **🤖 Preparado para Escalar:**
   - Arquitectura desacoplada y orientada a eventos, lista para integrarse con modelos de Inteligencia Artificial y microservicios.

---

## 🛠️ Arquitectura y Tecnologías

- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Node.js runtime)
- **Control de Versiones:** Git & GitHub
- **Integraciones:** WhatsApp Business API / Webhooks, generador de códigos QR y servicios de autenticación.

---

## 📦 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18.x o 20.x LTS recomendada)
- Gestor de paquetes: `npm` o `pnpm` / `yarn`
- Base de datos relacional o documental (según la configuración del entorno)

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/ecloudlatam/core-ecloudlab.git](https://github.com/ecloudlatam/core-ecloudlab.git)
   cd core-ecloudlab
