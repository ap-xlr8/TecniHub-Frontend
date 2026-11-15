# Configuración PWA

Angular CLI instaló `@angular/pwa` 22.2.7, Service Worker, `ngsw-config.json`, manifest e iconos estándar. En producción `provideServiceWorker` registra `ngsw-worker.js`; en desarrollo queda deshabilitado. La configuración cachea shell estático y recursos gráficos tipados, no respuestas API ni datos de usuario.

## Verificación local

1. Instala y compila: `npm ci; npm run build; npm run pwa:verify`.
2. Ejecuta `npm start -- --configuration production` y abre `http://localhost:4200`. `localhost` es un origen seguro para pruebas locales; confirma en el navegador la opción de instalar. No uses solo `npm start` de desarrollo para validar el worker, que está deshabilitado allí.
3. En DevTools > Application, revisa manifest, service worker y Cache Storage. Desconecta la red para comprobar la shell y recursos cacheados; la API/datos no tienen modo offline implementado.
4. Publica una compilación nueva y revisa el aviso de actualización/reload con el navegador. No se ha definido todavía una UX de actualización.
5. Para limpiar una prueba, elimina el registro y almacenamiento del sitio en DevTools.

Los iconos generados son los recursos estándar del schematic, pendientes de sustitución por diseño aprobado. HTTPS será obligatorio fuera de localhost. El navegador y sistema operativo controlan instalación y compatibilidad; Push no está implementado. No se solicitan permisos de notificación.
