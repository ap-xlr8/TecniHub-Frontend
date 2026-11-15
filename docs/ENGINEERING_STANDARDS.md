# Estándares comunes TECNIHUB

- Mantener frontend Angular y backend ASP.NET Core en repositorios Git locales independientes.
- No implementar requisitos de negocio sin aprobación ni duplicar responsabilidades entre cliente y API.
- Usar Conventional Commits, PR con evidencia y flujo HU → sprint → developer → release → main.
- Como hay una sola persona, registrar auto-revisión y CI sin afirmar aprobación independiente.
- Mantener secretos fuera del repositorio, logs, artefactos y bundles; revisar cambios de dependencias.
- Requerir formato, lint/análisis, build y tests antes de integrar una HU.
- Registrar evidencia como configurada, ejecutada, verificada, pendiente o no disponible; no falsificar resultados.
- Los deploys, protecciones y detección hospedada dependen de GitHub/Azure; requieren habilitación/recursos externos y autorización correspondiente.
