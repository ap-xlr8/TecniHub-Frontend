# TECNIHUB Frontend

Base Angular 22 para la PWA TECNIHUB. El proyecto contiene routing, Service Worker, manifest e iconos iniciales, sin pantallas o flujos de negocio.

## Requisitos

- Node.js 24 LTS (`.nvmrc`, actualmente 24.20.0) y npm.
- La versión Angular CLI y las dependencias están fijadas por `package-lock.json` (Angular 22.2.x).

## Instalar y ejecutar

```powershell
npm ci
npm start
```

La app se sirve normalmente en `http://localhost:4200`. La API local indicada en `src/environments/environment.development.ts` es `https://localhost:7113/api`, tomada del perfil HTTPS actual del backend; no existen endpoints de TECNIHUB todavía.

## Verificaciones

```powershell
npm run format:check
npm run lint
npm run build
npm run pwa:verify
npm run test:ci
npm audit --audit-level=high
```

La prueba actual solo verifica que se crea el shell vacío. No es una prueba de negocio.

## Carpetas de aplicación

- `core`: integración/configuración global cuando aparezca una necesidad concreta.
- `shared`: UI/elementos comunes que tengan al menos dos usos reales.
- `features`: funcionalidades aprobadas, sin capas vacías anticipadas.

La estructura y la estrategia de Service Worker se explican en `docs/`.
