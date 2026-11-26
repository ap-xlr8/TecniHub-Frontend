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
        <p class="page-lead">Selecciona el tipo de cuenta que corresponde a tu perfil.</p>

        <div class="role-cards">
          <a routerLink="/registro/cliente" class="role-card">
            <h2>Soy Cliente</h2>
            <p>
              Publica solicitudes de reparación de electrodomésticos, consulta su avance y confirma
              el cierre del servicio.
            </p>
            <span class="btn btn-primary">Registrarme como cliente</span>
          </a>

          <a routerLink="/registro/tecnico" class="role-card">
            <h2>Soy Técnico</h2>
            <p>
              Consulta solicitudes disponibles en tu zona, gestiona tu itinerario y publica
              refacciones en el tablón.
            </p>
            <span class="btn btn-secondary">Registrarme como técnico</span>
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
