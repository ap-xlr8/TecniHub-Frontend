import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationListResponse,
  UserNotificationDto,
  VapidPublicKeyResponse,
} from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush, { optional: true });
  private readonly router = inject(Router);
  private readonly apiBase = `${environment.apiUrl}/notifications`;

  private readonly itemsSignal = signal<UserNotificationDto[]>([]);
  private readonly unreadCountSignal = signal(0);
  private readonly pushSubscribedSignal = signal(false);
  private readonly pushSupportedSignal = signal(false);

  readonly items = this.itemsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly pushSubscribed = this.pushSubscribedSignal.asReadonly();
  readonly pushSupported = this.pushSupportedSignal.asReadonly();

  constructor() {
    const supported = Boolean(this.swPush?.isEnabled);
    this.pushSupportedSignal.set(supported);

    if (supported && this.swPush) {
      this.swPush.subscription.subscribe((sub) => {
        this.pushSubscribedSignal.set(sub !== null);
      });

      this.swPush.notificationClicks.subscribe((click) => {
        const url = (click.notification.data as { url?: string } | undefined)?.url;
        if (url && url.startsWith('/') && !url.startsWith('//')) {
          void this.router.navigateByUrl(url);
        }
      });
    }
  }

  refresh(): Observable<NotificationListResponse> {
    return this.http.get<NotificationListResponse>(this.apiBase).pipe(
      tap((res) => {
        this.itemsSignal.set(res.items);
        this.unreadCountSignal.set(res.unreadCount);
      }),
    );
  }

  pushIncoming(item: UserNotificationDto): void {
    this.itemsSignal.update((current) => {
      if (current.some((x) => x.id === item.id)) {
        return current;
      }
      return [item, ...current].slice(0, 40);
    });
    if (!item.isRead) {
      this.unreadCountSignal.update((c) => c + 1);
    }
  }

  markAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/${encodeURIComponent(id)}/read`, {}).pipe(
      tap(() => {
        let decremented = false;
        this.itemsSignal.update((list) =>
          list.map((n) => {
            if (n.id === id && !n.isRead) {
              decremented = true;
              return { ...n, isRead: true, readAt: new Date().toISOString() };
            }
            return n;
          }),
        );
        if (decremented) {
          this.unreadCountSignal.update((c) => Math.max(0, c - 1));
        }
      }),
    );
  }

  markAllAsRead(): Observable<{ marked: number }> {
    return this.http.post<{ marked: number }>(`${this.apiBase}/read-all`, {}).pipe(
      tap(() => {
        const now = new Date().toISOString();
        this.itemsSignal.update((list) => list.map((n) => ({ ...n, isRead: true, readAt: now })));
        this.unreadCountSignal.set(0);
      }),
    );
  }

  getVapidKey(): Observable<VapidPublicKeyResponse> {
    return this.http.get<VapidPublicKeyResponse>(`${this.apiBase}/vapid-public-key`);
  }

  async enableBrowserPush(): Promise<{ ok: boolean; message: string }> {
    if (!this.swPush || !this.swPush.isEnabled) {
      return {
        ok: false,
        message:
          'Las notificaciones push del navegador requieren la PWA instalada/compilada con Service Worker activo. Las notificaciones internas en la campanita siguen funcionando.',
      };
    }

    try {
      const vapid = await firstValueFrom(this.getVapidKey());
      if (!vapid.enabled || !vapid.publicKey) {
        return {
          ok: false,
          message: 'El servidor no tiene clave pública VAPID configurada en este entorno.',
        };
      }

      const sub = await this.swPush.requestSubscription({
        serverPublicKey: vapid.publicKey,
      });
      const json = sub.toJSON();
      const p256dh = json.keys?.['p256dh'] ?? '';
      const auth = json.keys?.['auth'] ?? '';

      await firstValueFrom(
        this.http.post<void>(`${this.apiBase}/push-subscriptions`, {
          endpoint: sub.endpoint,
          p256dh,
          auth,
        }),
      );

      this.pushSubscribedSignal.set(true);
      return {
        ok: true,
        message: 'Notificaciones push activadas correctamente en este dispositivo.',
      };
    } catch {
      return {
        ok: false,
        message:
          'No fue posible activar las notificaciones push. Revisa los permisos del navegador.',
      };
    }
  }
}
