import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface BreadcrumbItem {
  label: string;
  url: string | null;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  private readonly currentPath = signal(this.normalizePath(this.router.url));
  private readonly dynamicLabel = signal<string | null>(null);

  readonly items = computed<BreadcrumbItem[]>(() =>
    this.buildTrail(this.currentPath(), this.auth.userRole(), this.dynamicLabel()),
  );

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath.set(this.normalizePath(event.urlAfterRedirects || event.url));
        this.dynamicLabel.set(null);
      });
  }

  setDynamicLabel(label: string | null): void {
    const clean = label?.trim() || null;
    this.dynamicLabel.set(clean);
  }

  private normalizePath(url: string): string {
    const clean = url.split('?')[0]?.split('#')[0] ?? '/';
    return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean;
  }

  private buildTrail(
    path: string,
    role: 'Client' | 'Technician' | null,
    leafLabel: string | null,
  ): BreadcrumbItem[] {
    const homeItem: BreadcrumbItem =
      role === 'Technician'
        ? { label: 'Tablón de servicios', url: '/tecnico' }
        : { label: 'Mis solicitudes', url: '/cliente' };

    if (path === '/cliente') {
      return [{ label: 'Mis solicitudes', url: null }];
    }

    if (path === '/cliente/nueva-solicitud') {
      return [homeItem, { label: 'Publicar reparación', url: null }];
    }

    if (path.startsWith('/cliente/solicitudes/')) {
      return [homeItem, { label: leafLabel ?? 'Detalle de solicitud', url: null }];
    }

    if (path === '/tecnico') {
      return [{ label: 'Tablón de servicios', url: null }];
    }

    if (path.startsWith('/tecnico/servicios/')) {
      return [homeItem, { label: leafLabel ?? 'Detalle de servicio', url: null }];
    }

    if (path === '/tecnico/itinerario') {
      return [homeItem, { label: 'Mi itinerario', url: null }];
    }

    if (path === '/tecnico/refacciones') {
      return [homeItem, { label: 'Refacciones', url: null }];
    }

    if (path === '/tecnico/refacciones/nueva') {
      return [
        homeItem,
        { label: 'Refacciones', url: '/tecnico/refacciones' },
        { label: 'Publicar refacción', url: null },
      ];
    }

    if (/^\/tecnico\/refacciones\/[^/]+\/editar$/.test(path)) {
      const partId = path.split('/')[3];
      return [
        homeItem,
        { label: 'Refacciones', url: '/tecnico/refacciones' },
        { label: leafLabel ?? 'Detalle de refacción', url: `/tecnico/refacciones/${partId}` },
        { label: 'Editar', url: null },
      ];
    }

    if (path.startsWith('/tecnico/refacciones/')) {
      return [
        homeItem,
        { label: 'Refacciones', url: '/tecnico/refacciones' },
        { label: leafLabel ?? 'Detalle de refacción', url: null },
      ];
    }

    if (path === '/mensajes') {
      return [homeItem, { label: 'Mensajes', url: null }];
    }

    if (path.startsWith('/mensajes/')) {
      return [
        homeItem,
        { label: 'Mensajes', url: '/mensajes' },
        { label: leafLabel ?? 'Conversación', url: null },
      ];
    }

    if (path === '/perfil') {
      return [homeItem, { label: 'Mi perfil', url: null }];
    }

    if (path === '/perfil/editar') {
      return [
        homeItem,
        { label: 'Mi perfil', url: '/perfil' },
        { label: 'Editar perfil', url: null },
      ];
    }

    if (path.startsWith('/perfiles/tecnico/')) {
      return [homeItem, { label: leafLabel ?? 'Perfil público de técnico', url: null }];
    }

    if (path.startsWith('/perfiles/cliente/')) {
      return [homeItem, { label: leafLabel ?? 'Perfil público de cliente', url: null }];
    }

    return [homeItem];
  }
}
