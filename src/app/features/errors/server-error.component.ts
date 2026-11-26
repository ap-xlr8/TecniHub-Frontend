import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { GlobalErrorService } from '../../core/errors/global-error.service';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="server-error-title" style="text-align: center">
        <div class="brand-header" style="justify-content: center">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div style="text-align: left">
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Estado del servicio</p>
          </div>
        </div>

        <p class="error-code-badge error-code-badge--danger" aria-hidden="true">
          {{ errorCodeLabel() }}
        </p>
        <h1 id="server-error-title" class="page-title">
          {{ globalErrors.error()?.title || 'No fue posible conectar con el servidor' }}
        </h1>
        <p class="page-lead">
          {{
            globalErrors.error()?.message ||
              'El servicio no respondió en este momento o ocurrió un error interno temporal. Verifica tu conexión e intenta nuevamente.'
          }}
        </p>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap">
          <button type="button" class="btn btn-primary" (click)="retry()">Reintentar</button>
          <a [routerLink]="homeRoute()" class="btn btn-secondary" (click)="globalErrors.dismiss()">
            Ir al inicio
          </a>
        </div>
      </section>
    </main>
  `,
})
export class ServerErrorComponent {
  protected readonly globalErrors = inject(GlobalErrorService);
  private readonly auth = inject(AuthService);

  protected readonly errorCodeLabel = computed(() => {
    const status = this.globalErrors.error()?.status;
    return status && status >= 500 ? String(status) : '500';
  });

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

  protected retry(): void {
    this.globalErrors.dismiss();
    globalThis.location?.reload();
  }
}
