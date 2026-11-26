import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-role',
  imports: [RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card auth-card--wide" aria-labelledby="role-heading">
        <header class="brand-header">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Crear cuenta nueva</p>
          </div>
        </header>

        <h1 id="role-heading" class="page-title">¿Cómo deseas usar TECNIHUB?</h1>
        <p class="page-lead">
          Selecciona la tarjeta correspondiente al tipo de cuenta que necesitas.
        </p>

        <div class="role-cards">
          <a routerLink="/registro/cliente" class="role-card role-card--clean">
            <div class="role-card-top">
              <span class="role-card-icon" aria-hidden="true">🏠</span>
              <span class="role-card-arrow" aria-hidden="true">→</span>
            </div>
            <h2>Soy Cliente</h2>
            <p>
              Publica solicitudes de reparación de electrodomésticos, da seguimiento paso a paso a
              tu visita y confirma el cierre del servicio.
            </p>
          </a>

          <a routerLink="/registro/tecnico" class="role-card role-card--clean">
            <div class="role-card-top">
              <span class="role-card-icon" aria-hidden="true">🛠️</span>
              <span class="role-card-arrow" aria-hidden="true">→</span>
            </div>
            <h2>Soy Técnico</h2>
            <p>
              Consulta solicitudes disponibles en tu zona, gestiona tu itinerario, atiende clientes
              y publica refacciones en el tablón.
            </p>
          </a>
        </div>

        <footer class="auth-footer">
          <span>¿Ya tienes una cuenta?</span>
          <a routerLink="/iniciar-sesion">Iniciar sesión</a>
        </footer>
      </section>
    </main>
  `,
})
export class RegisterRoleComponent {}
