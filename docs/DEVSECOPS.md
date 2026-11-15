# DevSecOps

La CI ejecuta ESLint, Prettier y `npm audit` (bloquea severidad alta/crítica). Dependabot propone actualizaciones npm y Actions semanalmente; las versiones principales se revisan en PR. CodeQL analiza JavaScript/TypeScript si el plan/visibilidad de GitHub permite Code Scanning. Dependency Review señala vulnerabilidades altas nuevas en PR.

Secret Scanning y Push Protection requieren configuración remota y disponibilidad según plan. ZAP Baseline está preparado en un workflow manual de staging; necesita URL aprobada, no escanea producción y sus alertas iniciales no bloquean el pipeline. No hay contenedores, por lo que Trivy no aplica. Mantén secretos fuera de Angular: todo valor compilado es público.
