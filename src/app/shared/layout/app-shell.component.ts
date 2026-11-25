import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-shell">
      <header class="topbar">
        <a
          class="home-brand"
          [routerLink]="auth.userRole() === 'Technician' ? '/tecnico' : '/cliente'"
        >
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">
              {{ auth.userRole() === 'Technician' ? 'Espacio de Técnico' : 'Espacio de Cliente' }}
            </p>
          </div>
        </a>

        <nav class="app-nav" aria-label="Navegación principal">
          @if (auth.userRole() === 'Client') {
            <a
              routerLink="/cliente"
              routerLinkActive="app-nav-link--active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="app-nav-link"
            >
              Mis solicitudes
            </a>
            <a
              routerLink="/cliente/nueva-solicitud"
              routerLinkActive="app-nav-link--active"
              class="app-nav-link"
            >
              Publicar reparación
            </a>
          } @else if (auth.userRole() === 'Technician') {
            <a
              routerLink="/tecnico"
              routerLinkActive="app-nav-link--active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="app-nav-link"
            >
              Tablón servicios
            </a>
            <a
              routerLink="/tecnico/itinerario"
              routerLinkActive="app-nav-link--active"
              class="app-nav-link"
            >
              Itinerario
            </a>
            <a
              routerLink="/tecnico/refacciones"
              routerLinkActive="app-nav-link--active"
              class="app-nav-link"
            >
              Refacciones
            </a>
          }

          <a routerLink="/mensajes" routerLinkActive="app-nav-link--active" class="app-nav-link">
            Mensajes
            @if (chat.unreadCount() > 0) {
              <span class="unread-badge" aria-label="Mensajes sin leer">
                {{ chat.unreadCount() }}
              </span>
            }
          </a>

          <a routerLink="/perfil" routerLinkActive="app-nav-link--active" class="app-nav-link">
            Mi perfil
          </a>
        </nav>

        <div class="topbar-actions">
          <span class="role-pill" [class.role-pill--teal]="auth.userRole() === 'Technician'">
            {{ auth.userRole() === 'Technician' ? 'Técnico' : 'Cliente' }}
          </span>
          <button type="button" class="btn btn-secondary btn-sm" (click)="onLogout()">
            Cerrar sesión
          </button>
        </div>
      </header>

      @if (isOffline()) {
        <div class="offline-banner" role="status">
          Sin conexión a internet. Puedes consultar la interfaz, pero publicar, aceptar o enviar
          mensajes requiere conexión activa.
        </div>
      }

      <main class="dashboard-main">
        <ng-content />
      </main>
    </div>
  `,
})
export class AppShellComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  protected readonly isOffline = signal(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  private unreadIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly onOnline = (): void => this.isOffline.set(false);
  private readonly onOffline = (): void => this.isOffline.set(true);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onOnline);
      window.addEventListener('offline', this.onOffline);
    }

    this.pollUnread();
    this.unreadIntervalId = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        this.pollUnread();
      }
    }, 15000);
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onOnline);
      window.removeEventListener('offline', this.onOffline);
    }

    if (this.unreadIntervalId !== null) {
      clearInterval(this.unreadIntervalId);
    }
  }

  protected onLogout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/iniciar-sesion');
    });
  }

  private pollUnread(): void {
    if (this.auth.isAuthenticated() && !this.isOffline()) {
      this.chat.refreshUnreadCount().subscribe({ error: () => undefined });
    }
  }
}
