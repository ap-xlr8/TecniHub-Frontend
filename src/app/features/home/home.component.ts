import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div id="inicio" class="home-shell">
      <header class="home-header">
        <div class="home-header-inner">
          <a routerLink="/" class="home-brand" aria-current="page">
            <span class="brand-badge" aria-hidden="true">TH</span>
            <span>
              <span class="brand-title" style="display: block">TECNIHUB</span>
              <span class="brand-subtitle" style="display: block">
                Servicios técnicos y refacciones
              </span>
            </span>
          </a>

          <nav class="home-anchor-nav" aria-label="Secciones de la página">
            <a href="#inicio" class="home-anchor-link home-anchor-link--active">Inicio</a>
            <a href="#que-necesitas" class="home-anchor-link">Servicios</a>
            <a href="#como-funciona" class="home-anchor-link">¿Cómo funciona?</a>
            <a href="#ecosistema" class="home-anchor-link">Refacciones</a>
          </nav>

          <nav class="home-nav" aria-label="Acceso de cuenta">
            @if (pwaInstall.canInstall()) {
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="pwaInstall.promptInstall()"
              >
                Instalar app
              </button>
            }

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

      <main class="view-transition">
        <section class="home-hero-band" aria-labelledby="hero-heading">
          <div class="home-hero-inner">
            <div class="hero-content">
              <p class="hero-pill-badge">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Servicios técnicos y refacciones · PWA</span>
              </p>

              <h1 id="hero-heading" class="hero-title">
                Reparaciones y soluciones para tus electrodomésticos,
                <span class="hero-title-accent">en un solo lugar.</span>
              </h1>

              <p class="hero-lead">
                Publica fallas con fotografías, coordina en chat en tiempo real con técnicos
                verificados, valida su llegada con código PIN presencial y consulta refacciones
                entre especialistas.
              </p>

              <div class="hero-actions">
                @if (auth.isAuthenticated()) {
                  @if (auth.userRole() === 'Technician') {
                    <a routerLink="/tecnico" class="btn btn-primary btn-hero">
                      Explorar tablón de servicios →
                    </a>
                    <a routerLink="/tecnico/itinerario" class="btn btn-secondary btn-hero">
                      Mi itinerario
                    </a>
                  } @else {
                    <a routerLink="/cliente/nueva-solicitud" class="btn btn-primary btn-hero">
                      Solicitar reparación →
                    </a>
                    <a routerLink="/cliente" class="btn btn-secondary btn-hero">Mis solicitudes</a>
                  }
                } @else {
                  <a routerLink="/registro/cliente" class="btn btn-primary btn-hero">
                    Solicitar reparación →
                  </a>
                  <a routerLink="/registro/tecnico" class="btn btn-secondary btn-hero">
                    Soy técnico
                  </a>
                }
              </div>
            </div>

            <div class="hero-visual">
              <div class="hero-photo-frame">
                <img
                  src="images/home-hero-technician.jpg"
                  alt="Técnico de TECNIHUB revisando electrodomésticos del hogar"
                  class="hero-photo"
                  width="800"
                  height="600"
                  loading="eager"
                />
              </div>

              <div class="hero-float-chip hero-float-chip--top" aria-hidden="true">
                <span class="hero-chip-icon hero-chip-icon--teal">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Agenda 24 hrs</strong>
                  <span>Seguimiento paso a paso</span>
                </div>
              </div>

              <div class="hero-float-chip hero-float-chip--bottom" aria-hidden="true">
                <span class="hero-chip-icon hero-chip-icon--navy">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <strong>PIN presencial</strong>
                  <span>Llegada verificada en domicilio</span>
                </div>
              </div>
            </div>
          </div>

          <svg
            class="home-wave home-wave--bottom"
            viewBox="0 0 1440 72"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,24 C360,84 1080,-16 1440,36 L1440,72 L0,72 Z" fill="var(--th-bg)" />
          </svg>
        </section>

        <div class="home-main">
          <section id="que-necesitas" class="home-section" aria-labelledby="needs-heading">
            <div class="section-head">
              <h2 id="needs-heading" class="section-title">¿Qué necesitas hoy?</h2>
              <p class="section-lead">
                Elige el espacio diseñado para tu objetivo dentro de TECNIHUB
              </p>
            </div>

            <div class="quick-cards-grid">
              <a
                [routerLink]="
                  auth.isAuthenticated()
                    ? auth.userRole() === 'Technician'
                      ? '/tecnico'
                      : '/cliente/nueva-solicitud'
                    : '/registro/cliente'
                "
                class="quick-action-card"
              >
                <div class="quick-card-media quick-card-media--blue">
                  <img
                    src="images/home-appliances.jpg"
                    alt="Electrodomésticos de línea blanca y cocina"
                    width="400"
                    height="300"
                    loading="lazy"
                  />
                </div>
                <div class="quick-card-body">
                  <h3>Reparar un electrodoméstico</h3>
                  <p>
                    Publica tu falla con 1 a 6 fotos, protege tu domicilio y recibe atención
                    verificada.
                  </p>
                </div>
                <span class="quick-card-arrow" aria-hidden="true">→</span>
              </a>

              <a
                [routerLink]="
                  auth.isAuthenticated() && auth.userRole() === 'Technician'
                    ? '/tecnico/refacciones'
                    : '/registro/tecnico'
                "
                class="quick-action-card"
              >
                <div class="quick-card-media quick-card-media--teal">
                  <img
                    src="images/home-spare-parts.jpg"
                    alt="Refacciones para refrigeradores, lavadoras y línea blanca"
                    width="400"
                    height="300"
                    loading="lazy"
                  />
                </div>
                <div class="quick-card-body">
                  <h3>Tablón de refacciones</h3>
                  <p>
                    Espacio exclusivo para técnicos: consulta, publica o intercambia piezas
                    disponibles.
                  </p>
                </div>
                <span class="quick-card-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </section>

          <section id="como-funciona" class="home-section" aria-labelledby="steps-heading">
            <div class="section-head">
              <h2 id="steps-heading" class="section-title">¿Cómo funciona TECNIHUB?</h2>
              <p class="section-lead">Un flujo claro, transparente y seguro de principio a fin</p>
            </div>

            <ol class="stepper-grid">
              <li class="stepper-item">
                <div class="stepper-icon-wrap">
                  <span class="stepper-badge">1</span>
                  <span class="stepper-icon-circle" aria-hidden="true">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      />
                      <rect x="8" y="2" width="8" height="4" rx="1" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                  </span>
                </div>
                <h3>Regístrate y verifica</h3>
                <p>
                  Crea tu cuenta de cliente o técnico y valida tu correo con el código de 6 dígitos.
                </p>
              </li>

              <li class="stepper-item">
                <div class="stepper-icon-wrap">
                  <span class="stepper-badge">2</span>
                  <span class="stepper-icon-circle" aria-hidden="true">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                </div>
                <h3>Publica o acepta servicios</h3>
                <p>
                  Sube fotos del equipo, conversa en el chat en vivo y agenda la visita en horario
                  24 hrs.
                </p>
              </li>

              <li class="stepper-item">
                <div class="stepper-icon-wrap">
                  <span class="stepper-badge">3</span>
                  <span class="stepper-icon-circle stepper-icon-circle--teal" aria-hidden="true">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </span>
                </div>
                <h3>Da seguimiento y califica</h3>
                <p>
                  Recibe avisos de llegada, confirma con PIN de 4 dígitos, aprueba el cierre y deja
                  tu reseña en estrellas.
                </p>
              </li>
            </ol>
          </section>

          <section id="ecosistema" class="home-section" aria-label="Espacio técnico y refacciones">
            <div class="feature-banners-grid">
              <article class="feature-banner feature-banner--navy">
                <div class="feature-banner-copy">
                  <span class="banner-pill banner-pill--glass">¿Eres técnico?</span>
                  <h2>Gestiona tus solicitudes y organiza tu itinerario</h2>
                  <p>
                    Filtra servicios por municipio o código postal, programa tus visitas en agenda
                    24 hrs, chatea con tus clientes y construye reputación verificada.
                  </p>
                  <a
                    [routerLink]="
                      auth.isAuthenticated() && auth.userRole() === 'Technician'
                        ? '/tecnico'
                        : '/registro/tecnico'
                    "
                    class="btn btn-light-solid"
                  >
                    {{
                      auth.isAuthenticated() && auth.userRole() === 'Technician'
                        ? 'Ir al tablón técnico →'
                        : 'Únete como técnico →'
                    }}
                  </a>
                </div>
                <div class="feature-banner-art" aria-hidden="true">
                  <svg
                    width="126"
                    height="126"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                  >
                    <circle cx="56" cy="40" r="18" />
                    <path d="M36 32h40c-2-10-10-16-20-16s-18 6-20 16Z" />
                    <path d="M26 96c2-18 14-28 30-28s28 10 30 28" />
                    <path
                      d="M84 56a12 12 0 0 0 14 14l-12 24a4 4 0 0 1-7-3l9-20a12 12 0 0 1-4-15Z"
                    />
                  </svg>
                </div>
              </article>

              <article class="feature-banner feature-banner--aqua">
                <div class="feature-banner-copy">
                  <span class="banner-pill banner-pill--teal">Refacciones al alcance</span>
                  <h2>Consulta y publica piezas entre técnicos</h2>
                  <p>
                    Encuentra compresores, tarjetas inverter, bombas y termostatos filtrando por
                    categoría, condición, modalidad y rango de precio.
                  </p>
                  <a
                    [routerLink]="
                      auth.isAuthenticated() && auth.userRole() === 'Technician'
                        ? '/tecnico/refacciones'
                        : '/registro/tecnico'
                    "
                    class="btn btn-teal"
                  >
                    Explorar refacciones →
                  </a>
                </div>
                <div class="feature-banner-img-wrap">
                  <img
                    src="images/home-spare-parts.jpg"
                    alt="Catálogo de refacciones técnicas"
                    width="320"
                    height="240"
                    loading="lazy"
                  />
                </div>
              </article>
            </div>
          </section>

          <section class="trust-strip" aria-label="Garantías y capacidades de la plataforma">
            <div class="trust-item">
              <span class="trust-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div>
                <strong>PIN de llegada presencial</strong>
                <span>Inicio de servicio validado en domicilio</span>
              </div>
            </div>

            <div class="trust-item">
              <span class="trust-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div>
                <strong>Chat y avisos en vivo</strong>
                <span>Mensajería SignalR y notificaciones push</span>
              </div>
            </div>

            <div class="trust-item">
              <span class="trust-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div>
                <strong>Privacidad de domicilio</strong>
                <span>Dirección exacta oculta hasta asignar</span>
              </div>
            </div>

            <div class="trust-item">
              <span class="trust-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
              </span>
              <div>
                <strong>Instalable como PWA</strong>
                <span>Celular, tablet y computadora</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer class="home-footer-dark">
        <svg
          class="home-wave home-wave--top"
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,32 C420,-10 1020,66 1440,16 L1440,56 L0,56 Z" fill="#0b2d52" />
        </svg>

        <div class="home-footer-dark-inner">
          <div class="home-footer-top">
            <a routerLink="/" class="home-brand home-brand--light">
              <span class="brand-badge brand-badge--light" aria-hidden="true">TH</span>
              <span>
                <span class="brand-title brand-title--light" style="display: block">TECNIHUB</span>
                <span class="brand-subtitle brand-subtitle--light" style="display: block">
                  Servicios técnicos y refacciones
                </span>
              </span>
            </a>

            <nav class="home-footer-nav" aria-label="Enlaces rápidos">
              <a routerLink="/iniciar-sesion">Iniciar sesión</a>
              <a routerLink="/registro/cliente">Registro cliente</a>
              <a routerLink="/registro/tecnico">Registro técnico</a>
              <a routerLink="/recuperar-contrasena">Recuperar contraseña</a>
            </nav>
          </div>

          <div class="home-footer-bottom">
            <span>© 2026 TECNIHUB. Plataforma PWA de servicios técnicos y refacciones.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly pwaInstall = inject(PwaInstallService);

  ngOnInit(): void {
    void this.auth.ensureSessionInitialized();
  }
}
