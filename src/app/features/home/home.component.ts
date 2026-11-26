import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home-shell">
      <header class="home-header">
        <div class="home-header-inner">
          <a routerLink="/" class="home-brand" aria-current="page">
            <span class="brand-badge" aria-hidden="true">TH</span>
            <span>
              <span class="brand-title" style="display: block">TECNIHUB</span>
              <span class="brand-subtitle" style="display: block"
                >Servicios técnicos y refacciones</span
              >
            </span>
          </a>

          <nav class="home-nav" aria-label="Navegación principal">
            @if (auth.isAuthenticated()) {
              <a [routerLink]="auth.getHomeRouteForRole(auth.userRole())" class="btn btn-primary">
                Ir a mi panel
              </a>
            } @else {
              <a routerLink="/iniciar-sesion" class="btn btn-secondary">Iniciar sesión</a>
              <a routerLink="/registro" class="btn btn-primary">Crear cuenta</a>
            }
          </nav>
        </div>
      </header>

      <main class="home-main">
        <section class="hero-section" aria-labelledby="hero-heading">
          <div class="hero-content">
            <p class="hero-eyebrow">Aplicación Web Progresiva · Clientes y Técnicos</p>
            <h1 id="hero-heading" class="hero-title">
              Conecta reparaciones de electrodomésticos y refacciones en un solo lugar
            </h1>
            <p class="hero-lead">
              TECNIHUB organiza tus solicitudes de reparación con técnicos verificados por correo y
              ofrece un tablón especializado de refacciones, disponible desde celular, tablet o
              computadora.
            </p>
            <div class="hero-actions">
              @if (auth.isAuthenticated()) {
                <a [routerLink]="auth.getHomeRouteForRole(auth.userRole())" class="btn btn-primary">
                  Abrir mi espacio ({{ auth.userRole() === 'Technician' ? 'Técnico' : 'Cliente' }})
                </a>
              } @else {
                <a routerLink="/registro" class="btn btn-primary">Crear cuenta gratis</a>
                <a routerLink="/iniciar-sesion" class="btn btn-secondary">Ya tengo cuenta</a>
              }
            </div>
          </div>

          <aside class="hero-card" aria-label="Resumen de beneficios">
            <h2 class="hero-card-title">Diseñada para uso diario</h2>
            <ul class="hero-highlights">
              <li>
                <strong>Acceso por rol</strong>
                <span>Experiencias independientes y seguras para Clientes y Técnicos.</span>
              </li>
              <li>
                <strong>Seguridad verificada</strong>
                <span
                  >Verificación de correo, contraseñas cifradas y sesión renovable de 7 días.</span
                >
              </li>
              <li>
                <strong>Instalable como PWA</strong>
                <span>Funciona de forma adaptable en celular, tablet y computadora.</span>
              </li>
            </ul>
          </aside>
        </section>

        <section class="home-section" aria-labelledby="roles-heading">
          <h2 id="roles-heading" class="section-title">Elige cómo participar en TECNIHUB</h2>
          <div class="home-roles-grid">
            <article class="panel-card home-role-panel">
              <span class="role-pill">Clientes</span>
              <h3>Publica y da seguimiento a tus reparaciones</h3>
              <p>
                Describe la falla de tu electrodoméstico, indica tu ubicación y horario preferido,
                sigue el avance del servicio y confirma el cierre cuando todo quede listo.
              </p>
              <a routerLink="/registro/cliente" class="btn btn-primary">Registrarme como cliente</a>
            </article>

            <article class="panel-card home-role-panel">
              <span class="role-pill role-pill--teal">Técnicos</span>
              <h3>Gestiona solicitudes y publica refacciones</h3>
              <p>
                Consulta solicitudes disponibles en tu zona, organiza tu itinerario de trabajo y
                consulta o publica refacciones en el tablón técnico especializado.
              </p>
              <a routerLink="/registro/tecnico" class="btn btn-teal">Registrarme como técnico</a>
            </article>
          </div>
        </section>

        <section class="home-section" aria-labelledby="steps-heading">
          <h2 id="steps-heading" class="section-title">¿Cómo funciona?</h2>
          <ol class="steps-grid">
            <li class="panel-card step-card">
              <span class="step-num" aria-hidden="true">1</span>
              <h3>Crea y verifica tu cuenta</h3>
              <p>
                Regístrate como cliente o técnico y valida tu correo con el código de 6 dígitos.
              </p>
            </li>
            <li class="panel-card step-card">
              <span class="step-num" aria-hidden="true">2</span>
              <h3>Accede a tu espacio</h3>
              <p>
                Inicia sesión de forma segura y mantén tu sesión activa hasta por 7 días en tu
                dispositivo.
              </p>
            </li>
            <li class="panel-card step-card">
              <span class="step-num" aria-hidden="true">3</span>
              <h3>Gestiona servicios y refacciones</h3>
              <p>
                Coordina reparaciones de principio a fin y consulta el tablón de refacciones entre
                técnicos.
              </p>
            </li>
          </ol>
        </section>
      </main>

      <footer class="home-footer">
        <div class="home-footer-inner">
          <span>TECNIHUB · Plataforma PWA de servicios técnicos y refacciones</span>
          <div class="home-footer-links">
            <a routerLink="/iniciar-sesion">Iniciar sesión</a>
            <a routerLink="/registro">Crear cuenta</a>
            <a routerLink="/recuperar-contrasena">Recuperar contraseña</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {
    void this.auth.ensureSessionInitialized();
  }
}
