# Guía de desarrollo

## Requisitos e instalación

Node.js 24.20.0 (`.nvmrc`) y npm. Desde la raíz:

```powershell
npm ci
npm start
```

El servidor dev usa `src/environments/environment.development.ts`. La API apunta al puerto HTTPS 7113 que genera el perfil backend actual; actualiza la URL si cambia `launchSettings.json`. No hay rutas API funcionales todavía.

## Calidad

```powershell
npm run format:check
npm run lint
npm run build
npm run pwa:verify
npm run test:ci
```

Usa componentes standalone y convenciones de Angular CLI. Añade pruebas que reflejen criterios de aceptación aprobados; no fijes porcentajes de cobertura antes de acordar un objetivo.
