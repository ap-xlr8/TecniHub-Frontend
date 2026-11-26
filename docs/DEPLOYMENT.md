# Despliegue

Los workflows `.github/workflows/deploy-staging.yml` y `deploy-production.yml` solo se inician manualmente. Staging admite `developer` o `release/*`; producción admite únicamente `main`. Cada uno repite instalación, formato, lint, build, pruebas y verificación PWA, publica el artefacto y comprueba la URL con `curl`. No se ha creado ni desplegado ningún recurso.

Configura GitHub Environments `staging` y `production` con límites de rama y define `AZURE_STATIC_WEB_APPS_URL` (variable por Environment) y `AZURE_STATIC_WEB_APPS_API_TOKEN` (secret por Environment). El token de despliegue es la autenticación requerida por la acción Azure Static Web Apps actual; no expongas ese valor. A diferencia del App Service backend, esta acción no ofrece OIDC en el flujo documentado, así que se conserva este único secreto de despliegue. Revisa el plan/región de Static Web Apps y disponibilidad de ambientes preview antes de habilitar staging. La prueba de salud valida la raíz pública del ambiente.

La compilación del frontend requiere Node.js 24 LTS: usa `actions/setup-node` con `node-version-file: front/.nvmrc` en GitHub Actions. El archivo `.nvmrc` fija `24.22.3` y `package.json` restringe Node a la serie 24. Para Static Web Apps configura como directorio de salida `dist/tecnihub-frontend/browser`.

El workflow `.github/workflows/zap-staging.yml` también es manual y acepta solo `developer` o `release/*`. Antes de ejecutarlo define `TECNIHUB_STAGING_URL` en el Environment `staging` y confirma que apunta al host HTTPS de pruebas autorizado. Ejecuta ZAP Baseline pasivo, no un active scan; adjunta su reporte y no bloquea por alertas inicial mientras se acuerdan umbrales. No se apunta a producción.

Para operación real, configura primero los ambientes/variables GitHub y recursos Azure bajo autorización del propietario. Ningún workflow se ejecutó en GitHub porque no hay repositorio remoto ni sesión autenticada.
