import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { UserAvatarComponent } from '../../shared/components/user-avatar.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-profile-view',
  imports: [AppShellComponent, RouterLink, UserAvatarComponent],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="profile-heading">
        <div class="page-header-row" style="margin-bottom: 1.25rem">
          <div style="display: flex; align-items: center; gap: 1rem">
            @if (auth.user(); as user) {
              <app-user-avatar
                [name]="user.firstName + ' ' + user.lastName"
                [avatarUrl]="user.avatarUrl"
                size="lg"
              />
            }
            <div>
              <h1 id="profile-heading" class="page-title">Mi perfil</h1>
              <p class="page-lead" style="margin: 0">
                Consulta los datos privados asociados a tu cuenta en TECNIHUB.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            @if (auth.user()?.role === 'Technician' && auth.user()?.id; as techId) {
              <a [routerLink]="['/perfiles/tecnico', techId]" class="btn btn-secondary">
                Ver mi perfil público
              </a>
            }
            <a routerLink="/perfil/editar" class="btn btn-primary">Editar perfil</a>
          </div>
        </div>

        @if (successBanner()) {
          <div class="alert alert-success" role="status" style="margin-bottom: 1rem">
            {{ successBanner() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
            {{ errorMessage() }}
          </div>
        }

        @if (loading()) {
          <p class="muted-value">Cargando información de tu perfil...</p>
        } @else if (auth.user(); as user) {
          <dl class="detail-dl">
            <div>
              <dt>Nombre</dt>
              <dd>{{ user.firstName }}</dd>
            </div>
            <div>
              <dt>Apellidos</dt>
              <dd>{{ user.lastName }}</dd>
            </div>
            <div>
              <dt>Correo electrónico</dt>
              <dd>{{ user.email }}</dd>
            </div>
            <div>
              <dt>Rol de cuenta</dt>
              <dd>{{ user.role === 'Technician' ? 'Técnico' : 'Cliente' }}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd [class.muted-value]="!user.phone">
                {{ user.phone || 'No proporcionado' }}
              </dd>
            </div>
            <div>
              <dt>Zona general pública</dt>
              <dd [class.muted-value]="!user.publicRegion">
                {{ user.publicRegion || 'No proporcionado' }}
              </dd>
            </div>
            <div>
              <dt>Estado del correo</dt>
              <dd>{{ user.isEmailVerified ? 'Verificado' : 'Pendiente de verificación' }}</dd>
            </div>
          </dl>

          @if (user.role === 'Technician') {
            <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.4rem 0" />
            <h2 style="margin: 0 0 0.85rem; font-size: 1.08rem">Datos profesionales</h2>
            <dl class="detail-dl">
              <div>
                <dt>Especialidades</dt>
                <dd [class.muted-value]="!user.technicianProfile?.specialties">
                  {{ user.technicianProfile?.specialties || 'No proporcionado' }}
                </dd>
              </div>
              <div>
                <dt>Años de experiencia</dt>
                <dd>
                  @if (user.technicianProfile !== null && user.technicianProfile !== undefined) {
                    {{ user.technicianProfile.experienceYears }} año(s)
                  } @else {
                    <span class="muted-value">No proporcionado</span>
                  }
                </dd>
              </div>
              <div>
                <dt>Zona de atención</dt>
                <dd [class.muted-value]="!user.technicianProfile?.serviceZone">
                  {{ user.technicianProfile?.serviceZone || 'No proporcionado' }}
                </dd>
              </div>
              <div>
                <dt>Nombre comercial</dt>
                <dd [class.muted-value]="!user.technicianProfile?.businessName">
                  {{ user.technicianProfile?.businessName || 'No proporcionado' }}
                </dd>
              </div>
            </dl>
          }
        }
      </section>

      <section class="panel-card danger-zone" aria-labelledby="delete-account-heading">
        <h2
          id="delete-account-heading"
          style="margin: 0 0 0.4rem; font-size: 1.05rem; color: var(--th-error)"
        >
          Eliminación gradual de cuenta
        </h2>
        <p style="margin: 0 0 1rem; color: var(--th-text-muted); font-size: 0.92rem">
          Al solicitar la baja, tus sesiones activas se cerrarán de inmediato, tus publicaciones
          abiertas se desactivarán y tus datos personales se anonimizarán de forma progresiva
          conservando el historial de auditoría.
        </p>
        <button type="button" class="btn btn-danger" (click)="openDeleteDialog()">
          Solicitar eliminación de cuenta
        </button>
      </section>

      <dialog #deleteDialog aria-labelledby="confirm-del-title">
        <h1 id="confirm-del-title" class="page-title" style="font-size: 1.2rem">
          Confirmar baja gradual de cuenta
        </h1>
        <p style="margin: 0 0 1.25rem; color: var(--th-text-muted)">
          Tu cuenta quedará desactivada, tus publicaciones abiertas se retirarán y tus sesiones
          activas se cerrarán de inmediato. ¿Deseas continuar?
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
          <button type="button" class="btn btn-secondary" autofocus (click)="closeDeleteDialog()">
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
    </app-shell>
  `,
})
export class ProfileViewComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly realtime = inject(RealtimeService);
  private readonly router = inject(Router);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly loading = signal(true);
  protected readonly deleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successBanner = signal<string | null>(null);

  ngOnInit(): void {
    const navState = history.state as { profileUpdated?: boolean } | null;
    if (navState?.profileUpdated) {
      this.successBanner.set('Los cambios de tu perfil se guardaron correctamente.');
    }

    this.profileService.getOwnProfile().subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
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
        void this.realtime.disconnect();
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
