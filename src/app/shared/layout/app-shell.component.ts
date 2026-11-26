import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserNotificationDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { UserAvatarComponent } from '../components/user-avatar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, DatePipe, UserAvatarComponent],
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
          @if (pwaInstall.canInstall()) {
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              (click)="pwaInstall.promptInstall()"
            >
              Instalar app
            </button>
          }

          <div class="notif-wrapper">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              aria-label="Centro de notificaciones"
              [attr.aria-expanded]="notifOpen()"
              (click)="toggleNotifications()"
            >
              🔔
              @if (notifications.unreadCount() > 0) {
                <span class="unread-badge">{{ notifications.unreadCount() }}</span>
              }
            </button>

            @if (notifOpen()) {
              <section class="notif-popover" aria-label="Notificaciones recientes">
                <header class="notif-popover-header">
                  <strong>Notificaciones</strong>
                  @if (notifications.unreadCount() > 0) {
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      (click)="markAllNotificationsRead()"
                    >
                      Marcar leídas
                    </button>
                  }
                </header>

                <div class="notif-push-bar">
                  @if (notifications.pushSubscribed()) {
                    <span class="field-hint">Push VAPID activo en este dispositivo.</span>
                  } @else {
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      [disabled]="enablingPush()"
                      (click)="onEnablePush()"
                    >
                      {{ enablingPush() ? 'Activando...' : 'Activar avisos push' }}
                    </button>
                  }
                  @if (pushFeedback()) {
                    <p class="field-hint" style="margin: 0.3rem 0 0">{{ pushFeedback() }}</p>
                  }
                </div>

                <div class="notif-list">
                  @if (notifications.items().length === 0) {
                    <p class="muted-value" style="margin: 0.5rem 0; font-size: 0.88rem">
                      Sin notificaciones todavía.
                    </p>
                  } @else {
                    @for (n of notifications.items(); track n.id) {
                      <button
                        type="button"
                        class="notif-item"
                        [class.notif-item--unread]="!n.isRead"
                        (click)="openNotification(n)"
                      >
                        <strong>{{ n.title }}</strong>
                        <span>{{ n.body }}</span>
                        <span class="field-hint">{{ n.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                      </button>
                    }
                  }
                </div>
              </section>
            }
          </div>

          @if (auth.user(); as currentUser) {
            <a routerLink="/perfil" style="display: inline-flex; text-decoration: none">
              <app-user-avatar
                [name]="currentUser.firstName + ' ' + currentUser.lastName"
                [avatarUrl]="currentUser.avatarUrl"
                size="sm"
              />
            </a>
          }

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

      <main class="dashboard-main view-transition">
        <ng-content />
      </main>
    </div>
  `,
})
export class AppShellComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);
  protected readonly notifications = inject(NotificationsService);
  protected readonly pwaInstall = inject(PwaInstallService);
  private readonly realtime = inject(RealtimeService);
  private readonly router = inject(Router);

  protected readonly isOffline = signal(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );
  protected readonly notifOpen = signal(false);
  protected readonly enablingPush = signal(false);
  protected readonly pushFeedback = signal<string | null>(null);

  private unreadIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly subs = new Subscription();
  private readonly onOnline = (): void => this.isOffline.set(false);
  private readonly onOffline = (): void => this.isOffline.set(true);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onOnline);
      window.addEventListener('offline', this.onOffline);
    }

    if (this.auth.isAuthenticated() && !this.isOffline()) {
      void this.realtime.ensureConnected();
      this.refreshCounters();

      this.subs.add(
        this.realtime.notification$.subscribe((notif) => {
          this.notifications.pushIncoming(notif);
        }),
      );

      this.subs.add(
        this.realtime.chatMessage$.subscribe(() => {
          this.chat.bumpUnreadCount();
        }),
      );
    }

    this.unreadIntervalId = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        this.refreshCounters();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onOnline);
      window.removeEventListener('offline', this.onOffline);
    }

    if (this.unreadIntervalId !== null) {
      clearInterval(this.unreadIntervalId);
    }
  }

  protected toggleNotifications(): void {
    const next = !this.notifOpen();
    this.notifOpen.set(next);
    if (next && this.auth.isAuthenticated()) {
      this.notifications.refresh().subscribe({ error: () => undefined });
    }
  }

  protected openNotification(item: UserNotificationDto): void {
    if (!item.isRead) {
      this.notifications.markAsRead(item.id).subscribe({ error: () => undefined });
    }
    this.notifOpen.set(false);
    if (item.actionUrl && item.actionUrl.startsWith('/') && !item.actionUrl.startsWith('//')) {
      void this.router.navigateByUrl(item.actionUrl);
    }
  }

  protected markAllNotificationsRead(): void {
    this.notifications.markAllAsRead().subscribe({ error: () => undefined });
  }

  protected async onEnablePush(): Promise<void> {
    this.enablingPush.set(true);
    this.pushFeedback.set(null);
    const result = await this.notifications.enableBrowserPush();
    this.enablingPush.set(false);
    this.pushFeedback.set(result.message);
  }

  protected onLogout(): void {
    void this.realtime.disconnect();
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/iniciar-sesion');
    });
  }

  private refreshCounters(): void {
    if (this.auth.isAuthenticated() && !this.isOffline()) {
      this.chat.refreshUnreadCount().subscribe({ error: () => undefined });
      this.notifications.refresh().subscribe({ error: () => undefined });
    }
  }
}
