import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="not-found-title" style="text-align: center">
        <div class="brand-header" style="justify-content: center">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div style="text-align: left">
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Servicios técnicos y refacciones</p>
          </div>
        </div>

        <p class="error-code-badge" aria-hidden="true">404</p>
        <h1 id="not-found-title" class="page-title">Página no encontrada</h1>
        <p class="page-lead">
          La dirección que buscas no existe o cambió de ubicación. Puedes regresar a tu panel o
          volver a la página anterior.
        </p>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap">
          <a [routerLink]="homeRoute()" class="btn btn-primary">Ir al inicio</a>
          <button type="button" class="btn btn-secondary" (click)="goBack()">Volver atrás</button>
        </div>
      </section>
    </main>
  `,
})
export class NotFoundComponent {
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);

  protected readonly homeRoute = computed(() => {
    const role = this.auth.userRole();
    if (role === 'Technician') {
      return '/tecnico';
    }
    if (role === 'Client') {
      return '/cliente';
    }
    return '/';
  });

  protected goBack(): void {
    this.location.back();
  }
}
