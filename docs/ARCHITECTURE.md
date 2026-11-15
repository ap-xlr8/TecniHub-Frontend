# Arquitectura frontend

El workspace Angular 22 usa componentes standalone, routing y estructura orientada a features. El root contiene únicamente el `router-outlet`; no hay pantallas funcionales ni servicios de negocio.

`core` concentra integración global; `shared` aloja elementos reutilizados; `features` contiene módulos aprobados. Cuando una feature lo necesite, separa reglas puras en `domain`, casos de uso/contratos en `application`, adaptadores HTTP en `infrastructure` y componentes/rutas en `presentation`. No copies mecánicamente la estructura .NET, generes capas vacías o crees importaciones circulares. Domain debe evitar depender de Angular cuando sea viable.

`environment.ts` y los reemplazos de Angular CLI solo entregan configuración pública. La clave pública VAPID puede exponerse cuando exista push; las claves privadas, credenciales y tokens administrativos nunca forman parte del bundle.
