import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PublicReviewItemDto, RepairDetailDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { PublicProfileService } from '../../core/services/public-profile.service';
import { RepairsService } from '../../core/services/repairs.service';
import { ImageGalleryComponent } from '../../shared/components/image-gallery.component';
import { ImageUploaderCropperComponent } from '../../shared/components/image-uploader-cropper.component';
import { RepairTimelineComponent } from '../../shared/components/repair-timeline.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-client-repair-detail',
  imports: [
    AppShellComponent,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    ImageGalleryComponent,
    ImageUploaderCropperComponent,
    RepairTimelineComponent,
    DatePipe,
  ],
  template: `
    <app-shell>
      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando solicitud...</p></section>
      } @else if (errorMessage() && !repair()) {
        <section class="panel-card">
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
          <a routerLink="/cliente" class="btn btn-secondary" style="margin-top: 1rem">
            Volver a mis solicitudes
          </a>
        </section>
      } @else if (repair(); as item) {
        <section class="panel-card" aria-labelledby="repair-detail-heading">
          <div class="page-header-row" style="margin-bottom: 1rem">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap">
                <h1 id="repair-detail-heading" class="page-title" style="margin: 0">
                  {{ item.applianceName }}
                </h1>
                <app-status-badge [code]="item.status" [label]="item.statusLabel" />
              </div>
              @if (item.brandModel) {
                <p class="page-lead" style="margin: 0.25rem 0 0">{{ item.brandModel }}</p>
              }
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              @if (item.assignedTechnicianId) {
                <button
                  type="button"
                  class="btn btn-teal"
                  [disabled]="openingChat()"
                  (click)="openChat(item.id)"
                >
                  {{ openingChat() ? 'Abriendo...' : 'Chat con el técnico' }}
                </button>
              }
              <a routerLink="/cliente" class="btn btn-secondary">Volver</a>
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

          <app-repair-timeline [repair]="item" />

          @if (item.status === 'ClosureRequested') {
            <div
              class="alert alert-info"
              style="margin-bottom: 1.25rem; display: grid; gap: 0.6rem"
            >
              <div>
                <strong>Cierre solicitado por el técnico.</strong> Revisa que la reparación quedó
                concluida antes de confirmar la finalización. El servicio solo pasará a
                <strong>Completado</strong> cuando confirmes.
              </div>
              @if (item.closureNotes) {
                <div><strong>Notas del técnico:</strong> {{ item.closureNotes }}</div>
              }
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap">
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="busy()"
                  (click)="openConfirmClosureDialog()"
                >
                  Confirmar finalización del servicio
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  [disabled]="busy()"
                  (click)="openRejectClosureDialog()"
                >
                  Reportar pendiente
                </button>
              </div>
            </div>
          }

          <dl class="detail-dl" style="margin-bottom: 1.25rem">
            <div>
              <dt>Falla reportada</dt>
              <dd>{{ item.issueDescription }}</dd>
            </div>
            <div>
              <dt>Fecha y horario deseado</dt>
              <dd>{{ item.preferredDate }} · {{ item.preferredTimeSlot }}</dd>
            </div>
            <div>
              <dt>Técnico asignado</dt>
              <dd [class.muted-value]="!item.assignedTechnicianName">
                @if (item.assignedTechnicianId && item.assignedTechnicianName) {
                  <a [routerLink]="['/perfiles/tecnico', item.assignedTechnicianId]">
                    {{ item.assignedTechnicianName }} (ver perfil público)
                  </a>
                } @else {
                  Aún sin asignar
                }
              </dd>
            </div>
            <div>
              <dt>Programación de cita</dt>
              <dd [class.muted-value]="!item.scheduledStartAt">
                @if (item.scheduledStartAt) {
                  {{ item.scheduledStartAt | date: "dd/MM/yyyy HH:mm 'hrs'" }}
                } @else {
                  Pendiente de programación por el técnico
                }
              </dd>
            </div>
            <div>
              <dt>Ubicación</dt>
              <dd>
                {{ item.location.neighborhood }}, {{ item.location.municipality }},
                {{ item.location.state }} (CP {{ item.location.postalCode }})
              </dd>
            </div>
            @if (item.fullAddress; as addr) {
              <div>
                <dt>Domicilio completo (solo visible para ti y el técnico asignado)</dt>
                <dd>
                  {{ addr.street }}
                  @if (addr.exteriorNumber) {
                    #{{ addr.exteriorNumber }}
                  }
                  @if (addr.interiorNumber) {
                    Int. {{ addr.interiorNumber }}
                  }
                  @if (addr.addressReference) {
                    · {{ addr.addressReference }}
                  }
                </dd>
              </div>
            }
          </dl>

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.25rem 0" />

          <h2 style="margin: 0 0 0.75rem; font-size: 1.05rem">Fotografías</h2>
          @if (editingImages()) {
            <app-image-uploader-cropper
              inputId="edit-repair-photos"
              label="Actualizar fotografías de la solicitud"
              [minImages]="1"
              [maxImages]="6"
              [imageUrls]="draftImages()"
              (imageUrlsChange)="draftImages.set($event)"
            />
            <div style="display: flex; gap: 0.6rem; margin-top: 0.85rem; flex-wrap: wrap">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                [disabled]="busy()"
                (click)="saveImages(item.id)"
              >
                Guardar fotografías
              </button>
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                (click)="editingImages.set(false)"
              >
                Cancelar
              </button>
            </div>
          } @else {
            <app-image-gallery [images]="item.images" />
            @if (item.status !== 'Completed' && item.status !== 'Cancelled') {
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                style="margin-top: 0.85rem"
                (click)="startEditImages(item)"
              >
                Agregar o reemplazar fotografías
              </button>
            }
          }

          @if (
            item.status === 'Open' || item.status === 'Assigned' || item.status === 'Scheduled'
          ) {
            <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.25rem 0" />
            <button
              type="button"
              class="btn btn-danger btn-sm"
              [disabled]="busy()"
              (click)="openCancelDialog()"
            >
              Cancelar solicitud
            </button>
          }

          @if (item.status === 'Completed') {
            <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.25rem 0" />
            <section aria-labelledby="optional-review-heading" class="form-stack">
              <h2 id="optional-review-heading" style="margin: 0; font-size: 1.05rem">
                Reseña del servicio (opcional)
              </h2>

              @if (review(); as submitted) {
                <div class="alert alert-success">
                  <strong>
                    Tu reseña fue registrada:
                    <span class="star-display" aria-hidden="true">{{
                      formatStars(submitted.rating)
                    }}</span>
                    ({{ submitted.rating }}
                    {{ submitted.rating === 1 ? 'estrella' : 'estrellas' }}).
                  </strong>
                  @if (submitted.comment) {
                    <p style="margin: 0.35rem 0 0">{{ submitted.comment }}</p>
                  }
                </div>
              } @else {
                <p class="field-hint" style="margin: 0">
                  El cierre de tu reparación ya está confirmado. Si lo deseas, puedes calificar de
                  forma opcional la atención recibida (una sola reseña por servicio).
                </p>

                <form class="form-stack" (ngSubmit)="submitReview(item.id)">
                  <fieldset style="border: 0; padding: 0; margin: 0">
                    <legend style="font-weight: 600; font-size: 0.92rem; margin-bottom: 0.5rem">
                      Calificación (estrellas) *
                    </legend>
                    <div
                      class="star-rating-group"
                      role="radiogroup"
                      aria-label="Calificación en estrellas"
                    >
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <button
                          type="button"
                          role="radio"
                          class="star-rating-option"
                          [class.star-rating-option--selected]="reviewRating === star"
                          [attr.aria-checked]="reviewRating === star"
                          (click)="reviewRating = star"
                        >
                          <span class="star-rating-icons" aria-hidden="true">{{
                            formatStars(star)
                          }}</span>
                          <span>{{ star }} {{ star === 1 ? 'estrella' : 'estrellas' }}</span>
                        </button>
                      }
                    </div>
                  </fieldset>

                  <div class="field">
                    <label for="review-comment">Comentario (opcional, máx. 500 caracteres)</label>
                    <textarea
                      id="review-comment"
                      name="reviewComment"
                      rows="3"
                      maxlength="500"
                      class="input-control"
                      placeholder="Comparte brevemente tu experiencia con el servicio..."
                      [(ngModel)]="reviewComment"
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      class="btn btn-primary btn-sm"
                      [disabled]="submittingReview() || reviewRating < 1 || reviewRating > 5"
                    >
                      {{ submittingReview() ? 'Enviando...' : 'Publicar reseña opcional' }}
                    </button>
                  </div>
                </form>
              }
            </section>
          }
        </section>

        <dialog #confirmClosureDialog aria-labelledby="confirm-closure-title">
          <h1 id="confirm-closure-title" class="page-title" style="font-size: 1.2rem">
            Confirmar finalización del servicio
          </h1>
          <p style="margin: 0 0 1.25rem; color: var(--th-text-muted)">
            Al confirmar, esta reparación cambiará a <strong>Completado</strong>, saldrá de tus
            solicitudes activas y el chat pasará a solo lectura.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <button
              type="button"
              class="btn btn-secondary"
              autofocus
              (click)="closeConfirmClosureDialog()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="busy()"
              (click)="confirmClosure(item.id)"
            >
              {{ busy() ? 'Confirmando...' : 'Sí, confirmar finalización' }}
            </button>
          </div>
        </dialog>

        <dialog #rejectClosureDialog aria-labelledby="reject-closure-title">
          <h1 id="reject-closure-title" class="page-title" style="font-size: 1.2rem">
            Reportar pendiente en la reparación
          </h1>
          <p style="margin: 0 0 0.85rem; color: var(--th-text-muted)">
            El servicio volverá al estado <strong>En proceso</strong> y notificaremos al técnico con
            tu observación.
          </p>
          <div class="field" style="margin-bottom: 1rem">
            <label for="reject-closure-reason">Describe el pendiente (mín. 5 caracteres) *</label>
            <textarea
              id="reject-closure-reason"
              name="rejectClosureReason"
              rows="3"
              maxlength="500"
              class="input-control"
              placeholder="Ej. Aún presenta una fuga leve al centrifugar."
              [(ngModel)]="rejectClosureReason"
            ></textarea>
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <button
              type="button"
              class="btn btn-secondary"
              autofocus
              (click)="closeRejectClosureDialog()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="busy() || rejectClosureReason.trim().length < 5"
              (click)="rejectClosure(item.id)"
            >
              {{ busy() ? 'Enviando...' : 'Devolver a En proceso' }}
            </button>
          </div>
        </dialog>

        <dialog #cancelDialog aria-labelledby="cancel-repair-title">
          <h1 id="cancel-repair-title" class="page-title" style="font-size: 1.2rem">
            Cancelar solicitud
          </h1>
          <p style="margin: 0 0 0.85rem; color: var(--th-text-muted)">
            Tu solicitud quedará cancelada y, si ya tenía técnico asignado, le avisaremos de
            inmediato.
          </p>
          <div class="field" style="margin-bottom: 1rem">
            <label for="cancel-repair-reason">Motivo de cancelación (opcional)</label>
            <input
              id="cancel-repair-reason"
              name="cancelReason"
              type="text"
              maxlength="300"
              class="input-control"
              placeholder="Ej. Ya no requiero la visita en esta fecha"
              [(ngModel)]="cancelReason"
            />
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <button type="button" class="btn btn-secondary" autofocus (click)="closeCancelDialog()">
              Volver
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [disabled]="busy()"
              (click)="cancelRepair(item.id)"
            >
              {{ busy() ? 'Cancelando...' : 'Sí, cancelar solicitud' }}
            </button>
          </div>
        </dialog>
      }
    </app-shell>
  `,
})
export class ClientRepairDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repairs = inject(RepairsService);
  private readonly chat = inject(ChatService);
  private readonly publicProfiles = inject(PublicProfileService);
  private readonly auth = inject(AuthService);

  private readonly closureDialogRef =
    viewChild<ElementRef<HTMLDialogElement>>('confirmClosureDialog');
  private readonly rejectDialogRef =
    viewChild<ElementRef<HTMLDialogElement>>('rejectClosureDialog');
  private readonly cancelDialogRef = viewChild<ElementRef<HTMLDialogElement>>('cancelDialog');

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly openingChat = signal(false);
  protected readonly editingImages = signal(false);
  protected readonly submittingReview = signal(false);
  protected readonly draftImages = signal<string[]>([]);
  protected readonly repair = signal<RepairDetailDto | null>(null);
  protected readonly review = signal<PublicReviewItemDto | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);

  protected reviewRating = 5;
  protected reviewComment = '';
  protected rejectClosureReason = '';
  protected cancelReason = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.errorMessage.set('Identificador de solicitud no válido.');
      return;
    }

    this.repairs.getDetail(id).subscribe({
      next: (data) => {
        this.repair.set(data);
        this.loading.set(false);
        if (data.status === 'Completed') {
          this.loadExistingReview(data.id);
        }
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openConfirmClosureDialog(): void {
    this.closureDialogRef()?.nativeElement.showModal();
  }

  protected closeConfirmClosureDialog(): void {
    this.closureDialogRef()?.nativeElement.close();
  }

  protected confirmClosure(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.confirmClosure(id).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.closeConfirmClosureDialog();
        this.feedbackMessage.set('Servicio confirmado como Completado correctamente.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.closeConfirmClosureDialog();
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openRejectClosureDialog(): void {
    this.rejectClosureReason = '';
    this.rejectDialogRef()?.nativeElement.showModal();
  }

  protected closeRejectClosureDialog(): void {
    this.rejectDialogRef()?.nativeElement.close();
  }

  protected rejectClosure(id: string): void {
    const reason = this.rejectClosureReason.trim();
    if (reason.length < 5) {
      return;
    }

    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.rejectClosure(id, reason).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.closeRejectClosureDialog();
        this.feedbackMessage.set('Pendiente enviado. La reparación volvió a En proceso.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.closeRejectClosureDialog();
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openCancelDialog(): void {
    this.cancelDialogRef()?.nativeElement.showModal();
  }

  protected closeCancelDialog(): void {
    this.cancelDialogRef()?.nativeElement.close();
  }

  protected cancelRepair(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.cancel(id, this.cancelReason).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.closeCancelDialog();
        this.feedbackMessage.set('La solicitud fue cancelada.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.closeCancelDialog();
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected startEditImages(item: RepairDetailDto): void {
    this.draftImages.set(item.images.map((i) => i.imageUrl));
    this.editingImages.set(true);
  }

  protected saveImages(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.updateImages(id, this.draftImages()).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.editingImages.set(false);
        this.feedbackMessage.set('Fotografías actualizadas correctamente.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openChat(repairId: string): void {
    this.openingChat.set(true);
    this.errorMessage.set(null);
    this.chat.openRepairConversation(repairId).subscribe({
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

  protected submitReview(repairId: string): void {
    this.submittingReview.set(true);
    this.errorMessage.set(null);
    this.publicProfiles
      .createRepairReview(repairId, {
        rating: Number(this.reviewRating),
        comment: this.reviewComment.trim() || null,
      })
      .subscribe({
        next: (created) => {
          this.submittingReview.set(false);
          this.review.set(created);
          this.feedbackMessage.set('Gracias por compartir tu reseña.');
        },
        error: (err: unknown) => {
          this.submittingReview.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }

  protected formatStars(rating: number): string {
    const safe = Math.max(1, Math.min(5, Math.round(rating)));
    return '★'.repeat(safe) + '☆'.repeat(5 - safe);
  }

  private loadExistingReview(repairId: string): void {
    this.publicProfiles.getRepairReview(repairId).subscribe({
      next: (existing) => this.review.set(existing),
      error: () => undefined,
    });
  }
}
