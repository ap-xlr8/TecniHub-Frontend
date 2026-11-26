import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PublicTechnicianProfileDto } from '../../core/models/operations.models';
import { PublicProfileService } from '../../core/services/public-profile.service';
import { UserAvatarComponent } from '../../shared/components/user-avatar.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-technician-public-profile',
  imports: [AppShellComponent, DatePipe, DecimalPipe, UserAvatarComponent],
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
      } @else if (profile(); as tech) {
        <section class="panel-card" aria-labelledby="public-tech-heading">
          <div class="page-header-row" style="margin-bottom: 1.25rem">
            <div style="display: flex; align-items: center; gap: 1rem">
              <app-user-avatar [name]="tech.displayName" [avatarUrl]="tech.avatarUrl" size="lg" />
              <div>
                <h1 id="public-tech-heading" class="page-title">{{ tech.displayName }}</h1>
                <p class="page-lead" style="margin: 0">
                  Perfil público de técnico · Miembro desde
                  {{ tech.memberSinceUtc | date: 'MM/yyyy' }}
                </p>
              </div>
            </div>
            <button type="button" class="btn btn-secondary" (click)="goBack()">Volver</button>
          </div>

          <dl class="detail-dl">
            <div>
              <dt>Nombre comercial</dt>
              <dd [class.muted-value]="!tech.businessName">
                {{ tech.businessName || 'No proporcionado' }}
              </dd>
            </div>
            <div>
              <dt>Especialidades</dt>
              <dd>{{ tech.specialties }}</dd>
            </div>
            <div>
              <dt>Experiencia</dt>
              <dd>{{ tech.experienceYears }} año(s)</dd>
            </div>
            <div>
              <dt>Zona de atención</dt>
              <dd>{{ tech.serviceZone }}</dd>
            </div>
            <div>
              <dt>Servicios completados</dt>
              <dd>{{ tech.completedServicesCount }}</dd>
            </div>
            <div>
              <dt>Reputación verificada</dt>
              <dd>
                @if (tech.reviewCount > 0 && tech.averageRating !== null) {
                  <strong>
                    <span class="star-display" aria-hidden="true">★</span>
                    {{ tech.averageRating | number: '1.1-1' }} estrellas
                  </strong>
                  ({{ tech.reviewCount }} reseña{{ tech.reviewCount === 1 ? '' : 's' }})
                } @else {
                  <span class="muted-value">Aún no existen reseñas</span>
                }
              </dd>
            </div>
          </dl>
        </section>

        <section class="panel-card" aria-labelledby="tech-reviews-heading">
          <h2 id="tech-reviews-heading" style="margin: 0 0 0.85rem; font-size: 1.1rem">
            Reseñas de servicios completados
          </h2>

          @if (tech.reviews.length === 0) {
            <p class="muted-value" style="margin: 0">
              Aún no existen reseñas registradas para este técnico. Las reseñas son opcionales y
              provienen únicamente de reparaciones confirmadas como completadas.
            </p>
          } @else {
            <div class="form-stack">
              @for (review of tech.reviews; track review.id) {
                <article
                  style="
                    padding: 1rem;
                    border: 1px solid var(--th-border);
                    border-radius: var(--th-radius-sm);
                    background: var(--th-surface-subtle);
                    display: grid;
                    gap: 0.4rem;
                  "
                >
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      gap: 0.75rem;
                      flex-wrap: wrap;
                    "
                  >
                    <strong>
                      <span class="star-display" aria-hidden="true">{{
                        formatStars(review.rating)
                      }}</span>
                      {{ review.rating }} {{ review.rating === 1 ? 'estrella' : 'estrellas' }} ·
                      {{ review.applianceName }}
                    </strong>
                    <span class="field-hint">
                      {{ review.reviewerDisplayName }} · {{ review.createdAt | date: 'mediumDate' }}
                    </span>
                  </div>
                  @if (review.comment) {
                    <p style="margin: 0; font-size: 0.94rem">{{ review.comment }}</p>
                  } @else {
                    <p class="muted-value" style="margin: 0; font-size: 0.88rem">
                      Calificación sin comentario adicional.
                    </p>
                  }
                </article>
              }
            </div>
          }
        </section>
      }
    </app-shell>
  `,
})
export class TechnicianPublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly publicProfiles = inject(PublicProfileService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly profile = signal<PublicTechnicianProfileDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Perfil público de técnico no encontrado.');
      return;
    }

    this.publicProfiles.getTechnicianProfile(id).subscribe({
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

  protected formatStars(rating: number): string {
    const safe = Math.max(1, Math.min(5, Math.round(rating)));
    return '★'.repeat(safe) + '☆'.repeat(5 - safe);
  }

  protected goBack(): void {
    this.location.back();
  }
}
