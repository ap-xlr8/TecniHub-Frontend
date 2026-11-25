import { DatePipe, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PublicClientProfileDto } from '../../core/models/operations.models';
import { PublicProfileService } from '../../core/services/public-profile.service';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-client-public-profile',
  imports: [AppShellComponent, DatePipe],
  template: `
    <app-shell>
      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando perfil público...</p></section>
      } @else if (errorMessage()) {
        <section class="panel-card">
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
          <button
            type="button"
            class="btn btn-secondary"
            style="margin-top: 1rem"
            (click)="goBack()"
          >
            Volver
          </button>
        </section>
      } @else if (profile(); as client) {
        <section class="panel-card" aria-labelledby="public-client-heading">
          <div class="page-header-row" style="margin-bottom: 1.25rem">
            <div>
              <h1 id="public-client-heading" class="page-title">{{ client.displayName }}</h1>
              <p class="page-lead" style="margin: 0">
                Perfil público limitado de cliente · Miembro desde
                {{ client.memberSinceUtc | date: 'MM/yyyy' }}
              </p>
            </div>
            <button type="button" class="btn btn-secondary" (click)="goBack()">Volver</button>
          </div>

          <div class="alert alert-info" style="margin-bottom: 1.25rem; font-size: 0.88rem">
            Por privacidad, este perfil muestra únicamente datos generales autorizados y no expone
            correo, teléfono ni domicilio exacto.
          </div>

          <dl class="detail-dl">
            <div>
              <dt>Nombre</dt>
              <dd>{{ client.displayName }}</dd>
            </div>
            <div>
              <dt>Zona general</dt>
              <dd [class.muted-value]="!client.publicRegion">
                {{ client.publicRegion || 'No disponible' }}
              </dd>
            </div>
            <div>
              <dt>Antigüedad en TECNIHUB</dt>
              <dd>Miembro desde {{ client.memberSinceUtc | date: 'MM/yyyy' }}</dd>
            </div>
            <div>
              <dt>Servicios completados</dt>
              <dd>{{ client.completedServicesCount }}</dd>
            </div>
          </dl>
        </section>
      }
    </app-shell>
  `,
})
export class ClientPublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly publicProfiles = inject(PublicProfileService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly profile = signal<PublicClientProfileDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Perfil público de cliente no encontrado.');
      return;
    }

    this.publicProfiles.getClientProfile(id).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected goBack(): void {
    this.location.back();
  }
}
