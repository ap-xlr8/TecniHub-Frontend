# Notificaciones Push

El frontend tendrá Service Worker/Angular Service Worker como base, pero no registra dispositivos ni pide permisos en este scaffold. No hay suscripciones, UX, preferencias ni envío.

La futura implementación usará Web Push API/Notification API, pedirá permiso tras una acción contextual del usuario y enviará la clave pública VAPID a la API para crear suscripciones. La clave privada permanece en backend. Deben definirse expiración, múltiples dispositivos, preferencias, historial y estados junto con el contrato backend. Las alertas administrativas no se convierten automáticamente en avisos para usuarios.
