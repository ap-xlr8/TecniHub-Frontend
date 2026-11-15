# Aseguramiento de calidad

CI instala con `npm ci`, revisa dependencias con `npm audit --audit-level=high`, verifica Prettier y ESLint, compila en producción, comprueba la presencia de `ngsw.json`/manifest y ejecuta Vitest mediante el builder Angular.

La prueba inicial verifica solo el shell vacío. La Definition of Done para una HU futura exige criterios aprobados, pruebas correspondientes, lint/formato/build limpios y evidencia observada. No se fija cobertura sin datos de funcionalidades. Las pruebas de navegación e integración se incorporan cuando haya rutas y contratos definidos.
