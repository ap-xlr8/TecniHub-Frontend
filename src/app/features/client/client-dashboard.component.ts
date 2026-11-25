import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-client-dashboard',
  template: `
    <div class="dashboard-shell">
      <header class="topbar">
        <div class="brand-header" style="margin: 0">
          <div class="brand-badge" aria-hidden="true">TH</div>
          <div>
            <p class="brand-title">TECNIHUB</p>
            <p class="brand-subtitle">Espacio de Cliente</p>
          </div>
        </div>

        <div class="topbar-actions">
          <span class="role-pill">Rol: Cliente</span>
          <button type="button" class="btn btn-secondary" (click)="onLogout()">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main class="dashboard-main">
        <section class="panel-card" aria-labelledby="client-welcome">
          <h1 id="client-welcome" class="page-title">
            Hola, {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}
          </h1>
          <p class="page-lead" style="margin-bottom: 0.75rem">
            Tu cuenta de cliente está verificada y protegida con sesión renovable de hasta 7 días.
          </p>
          <p style="margin: 0; color: var(--th-text-muted); font-size: 0.92rem">
            Correo: <strong>{{ auth.user()?.email }}</strong>
            @if (auth.user()?.phone) {
              · Teléfono: <strong>{{ auth.user()?.phone }}</strong>
            }
          </p>
        </section>

        <section class="panel-grid" aria-label="Módulos próximos">
          <article class="panel-card">
            <h2 style="margin: 0 0 0.4rem; font-size: 1.05rem">Solicitudes de reparación</h2>
            <p style="margin: 0; color: var(--th-text-muted); font-size: 0.92rem">
              En el Sprint 2 podrás publicar solicitudes con fotos, consultar su avance y confirmar
              la finalización del servicio.
            </p>
          </article>

          <article class="panel-card">
            <h2 style="margin: 0 0 0.4rem; font-size: 1.05rem">Perfil propio</h2>
            <p style="margin: 0; color: var(--th-text-muted); font-size: 0.92rem">
              Próximamente podrás actualizar tus datos personales desde tu perfil (HU-005 y HU-006).
            </p>
          </article>
        </section>

        <section class="panel-card danger-zone" aria-labelledby="delete-account-heading">
          <h2
            id="delete-account-heading"
            style="margin: 0 0 0.4rem; font-size: 1.05rem; color: var(--th-error)"
          >
            Eliminación gradual de cuenta
          </h2>
          <p style="margin: 0 0 1rem; color: var(--th-text-muted); font-size: 0.92rem">
            Si solicitas la baja, tu sesión se revocará de inmediato y tus datos personales se
            anonimizarán gradualmente conservando la integridad de auditoría.
          </p>
          @if (errorMessage()) {
            <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
              {{ errorMessage() }}
            </div>
          }
          <button type="button" class="btn btn-danger" (click)="openDeleteDialog()">
            Solicitar eliminación de cuenta
          </button>
        </section>
      </main>

      <dialog
        #deleteDialog
        aria-labelledby="confirm-del-title"
        style="border: 1px solid var(--th-border); border-radius: var(--th-radius); padding: 1.5rem; max-width: 28rem"
      >
        <h2 id="confirm-del-title" style="margin: 0 0 0.5rem">Confirmar baja gradual</h2>
        <p style="margin: 0 0 1.25rem; color: var(--th-text-muted)">
          Tu cuenta quedará desactivada y tus sesiones activas se cerrarán de inmediato. ¿Deseas
          continuar?
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end">
          <button type="button" class="btn btn-secondary" (click)="closeDeleteDialog()">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-danger"
            [disabled]="deleting()"
            (click)="confirmDeletion()"
          >
            {{ deleting() ? 'Procesando...' : 'Sí, eliminar cuenta' }}
          </button>
        </div>
      </dialog>
    </div>
  `,
})
export class ClientDashboardComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly deleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onLogout(): void {
    this.auth.logout().subscribe(() => {
      void this.router.navigateByUrl('/iniciar-sesion');
    });
  }

  protected openDeleteDialog(): void {
    this.dialogRef()?.nativeElement.showModal();
  }

  protected closeDeleteDialog(): void {
    this.dialogRef()?.nativeElement.close();
  }

  protected confirmDeletion(): void {
    this.deleting.set(true);
    this.errorMessage.set(null);
    this.auth.requestAccountDeletion().subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeDeleteDialog();
        void this.router.navigateByUrl('/iniciar-sesion');
      },
      error: (err: unknown) => {
        this.deleting.set(false);
        this.closeDeleteDialog();
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }
}
