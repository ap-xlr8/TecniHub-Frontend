import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SparePartDetailDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { SparePartsService } from '../../core/services/spare-parts.service';
import { ImageGalleryComponent } from '../../shared/components/image-gallery.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-spare-part-detail',
  imports: [
    AppShellComponent,
    RouterLink,
    StatusBadgeComponent,
    ImageGalleryComponent,
    CurrencyPipe,
  ],
  template: `
    <app-shell>
      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando refacción...</p></section>
      } @else if (errorMessage() && !part()) {
        <section class="panel-card">
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
          <a routerLink="/tecnico/refacciones" class="btn btn-secondary" style="margin-top: 1rem">
            Volver a refacciones
          </a>
        </section>
      } @else if (part(); as item) {
        <section class="panel-card" aria-labelledby="spare-detail-heading">
          <div class="page-header-row" style="margin-bottom: 1rem">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap">
                <h1 id="spare-detail-heading" class="page-title" style="margin: 0">
                  {{ item.title }}
                </h1>
                <app-status-badge
                  [code]="item.isAvailable ? 'Available' : 'Unavailable'"
                  [label]="item.availabilityLabel"
                />
              </div>
              <div class="price-tag" style="margin-top: 0.35rem">
                {{ item.priceMxn | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }} MXN
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              @if (item.isOwner) {
                <a
                  [routerLink]="['/tecnico/refacciones', item.id, 'editar']"
                  class="btn btn-secondary btn-sm"
                >
                  Editar
                </a>
                <button
                  type="button"
                  class="btn btn-sm"
                  [class.btn-danger]="item.isAvailable"
                  [class.btn-primary]="!item.isAvailable"
                  [disabled]="busy()"
                  (click)="toggleAvailability(item)"
                >
                  {{ item.isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible' }}
                </button>
              }
              <a routerLink="/tecnico/refacciones" class="btn btn-secondary btn-sm">Volver</a>
            </div>
          </div>

          @if (feedbackMessage()) {
            <div class="alert alert-success" role="status" style="margin-bottom: 1rem">
              {{ feedbackMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
              {{ errorMessage() }}
            </div>
          }

          <dl class="detail-dl" style="margin-bottom: 1.25rem">
            <div>
              <dt>Descripción</dt>
              <dd>{{ item.description }}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{{ item.applianceCategory }}</dd>
            </div>
            <div>
              <dt>Compatibilidad</dt>
              <dd [class.muted-value]="!item.compatibility">
                {{ item.compatibility || 'No proporcionada' }}
              </dd>
            </div>
            <div>
              <dt>Condición y modalidad</dt>
              <dd>{{ item.conditionLabel }} · {{ item.modalityLabel }}</dd>
            </div>
            <div>
              <dt>Técnico oferente</dt>
              <dd>
                {{ item.technicianDisplayName }}
                @if (item.technicianBusinessName) {
                  ({{ item.technicianBusinessName }})
                }
              </dd>
            </div>
            <div>
              <dt>Zona del oferente</dt>
              <dd [class.muted-value]="!item.technicianZone">
                {{ item.technicianZone || 'No proporcionada' }}
              </dd>
            </div>
          </dl>

          <h2 style="margin: 0 0 0.75rem; font-size: 1.05rem">Fotografías</h2>
          <app-image-gallery [images]="item.images" />

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.35rem 0" />

          <section aria-labelledby="contact-seller-heading" class="form-stack">
            <h2 id="contact-seller-heading" style="margin: 0; font-size: 1.05rem">
              Contacto con el oferente
            </h2>
            <p class="field-hint" style="margin: 0">
              TECNIHUB no procesa pagos, envíos ni garantías. El acuerdo y entrega ocurren
              directamente entre técnicos fuera de la aplicación.
            </p>

            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap">
              @if (!item.isOwner && item.isAvailable) {
                <button
                  type="button"
                  class="btn btn-teal"
                  [disabled]="openingChat()"
                  (click)="openChat(item.id)"
                >
                  {{ openingChat() ? 'Abriendo...' : 'Abrir chat interno' }}
                </button>
              }

              @if (item.contactPhone) {
                <a [href]="'tel:' + item.contactPhone" class="btn btn-primary">
                  Llamar: {{ item.contactPhone }}
                </a>
              }

              @if (item.contactEmail) {
                <a [href]="'mailto:' + item.contactEmail" class="btn btn-secondary">
                  Correo: {{ item.contactEmail }}
                </a>
              }
            </div>

            @if (item.contactNotes) {
              <p style="margin: 0; font-size: 0.92rem">
                <strong>Notas de contacto:</strong> {{ item.contactNotes }}
              </p>
            }
          </section>
        </section>
      }
    </app-shell>
  `,
})
export class SparePartDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spareParts = inject(SparePartsService);
  private readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly openingChat = signal(false);
  protected readonly part = signal<SparePartDetailDto | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Publicación no encontrada.');
      return;
    }

    this.spareParts.getDetail(id).subscribe({
      next: (data) => {
        this.part.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected toggleAvailability(item: SparePartDetailDto): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.spareParts.setAvailability(item.id, !item.isAvailable).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.part.set(updated);
        this.feedbackMessage.set(
          updated.isAvailable
            ? 'La refacción volvió a mostrarse como disponible.'
            : 'La refacción se marcó como no disponible y salió del tablón activo.',
        );
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openChat(sparePartId: string): void {
    this.openingChat.set(true);
    this.errorMessage.set(null);
    this.chat.openSparePartConversation(sparePartId).subscribe({
      next: (conv) => {
        this.openingChat.set(false);
        void this.router.navigate(['/mensajes', conv.id]);
      },
      error: (err: unknown) => {
        this.openingChat.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }
}
