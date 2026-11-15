# Configuración de entorno frontend

Angular CLI reemplaza el archivo base mediante `angular.json`: `environment.ts` se usa en build de producción y `environment.development.ts` en serve/build de desarrollo. Los valores son públicos y terminan en código que el navegador puede inspeccionar.

| Campo        | Desarrollo                   | Producción                    | Sensibilidad |
| ------------ | ---------------------------- | ----------------------------- | ------------ |
| `production` | `false`                      | `true`                        | Pública      |
| `apiUrl`     | `https://localhost:7113/api` | Vacío hasta confirmar dominio | Pública      |

Configura el dominio productivo solo tras confirmar endpoint y CORS. No pongas secretos, connection strings, tokens permanentes, credenciales de Azure ni clave privada VAPID. `.env` no es leído automáticamente por Angular CLI y no se usa en este proyecto. No se implementa todavía configuración runtime; eso evita una segunda carga y consideraciones adicionales de caché.
