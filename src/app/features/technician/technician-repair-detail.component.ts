import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OverlappingAppointmentDto, RepairDetailDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { RepairsService } from '../../core/services/repairs.service';
import { ImageGalleryComponent } from '../../shared/components/image-gallery.component';
import { RepairTimelineComponent } from '../../shared/components/repair-timeline.component';
import { ScheduleAgendaPickerComponent } from '../../shared/components/schedule-agenda-picker.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-technician-repair-detail',
  imports: [
    AppShellComponent,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    ImageGalleryComponent,
    RepairTimelineComponent,
    ScheduleAgendaPickerComponent,
    DatePipe,
  ],
  template: `
    <app-shell>
      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando servicio...</p></section>
      } @else if (errorMessage() && !repair()) {
        <section class="panel-card">
          <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
          <a routerLink="/tecnico" class="btn btn-secondary" style="margin-top: 1rem">
            Volver al tablón
          </a>
        </section>
      } @else if (repair(); as item) {
        <section class="panel-card" aria-labelledby="tech-repair-title">
          <div class="page-header-row" style="margin-bottom: 1rem">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap">
                <h1 id="tech-repair-title" class="page-title" style="margin: 0">
                  {{ item.applianceName }}
                </h1>
                <app-status-badge [code]="item.status" [label]="item.statusLabel" />
              </div>
              @if (item.brandModel) {
                <p class="page-lead" style="margin: 0.25rem 0 0">{{ item.brandModel }}</p>
              }
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              @if (isAssignedToMe(item)) {
                <button
                  type="button"
                  class="btn btn-teal"
                  [disabled]="openingChat()"
                  (click)="openChat(item.id)"
                >
                  {{ openingChat() ? 'Abriendo...' : 'Chat con el cliente' }}
                </button>
              }
              <a
                [routerLink]="isAssignedToMe(item) ? '/tecnico/itinerario' : '/tecnico'"
                class="btn btn-secondary"
              >
                Volver
              </a>
            </div>
          </div>

          @if (feedbackMessage()) {
            <div class="alert alert-success" role="status" style="margin-bottom: 1rem">
              {{ feedbackMessage() }}
            </div>
          }

          @if (overlapWarning().length > 0) {
            <div class="alert alert-info" role="status" style="margin-bottom: 1rem">
              <strong>Aviso de traslape horario:</strong> Tu cita fue guardada, pero coincide dentro
              de 60 minutos con:
              <ul style="margin: 0.35rem 0 0; padding-left: 1.2rem">
                @for (ov of overlapWarning(); track ov.repairRequestId) {
                  <li>
                    {{ ov.applianceName }} ({{
                      ov.scheduledStartAt | date: "dd/MM/yyyy HH:mm 'hrs'"
                    }})
                  </li>
                }
              </ul>
            </div>
          }

          @if (errorMessage()) {
            <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
              {{ errorMessage() }}
            </div>
          }

          <app-repair-timeline [repair]="item" />

          <dl class="detail-dl" style="margin-bottom: 1.25rem">
            <div>
              <dt>Descripción de la falla</dt>
              <dd>{{ item.issueDescription }}</dd>
            </div>
            <div>
              <dt>Fecha y horario deseado</dt>
              <dd>{{ item.preferredDate }} · {{ item.preferredTimeSlot }}</dd>
            </div>
            <div>
              <dt>Ubicación (hasta colonia)</dt>
              <dd>
                {{ item.location.neighborhood }}, {{ item.location.municipality }},
                {{ item.location.state }} (CP {{ item.location.postalCode }})
              </dd>
            </div>
            @if (item.fullAddress; as addr) {
              <div>
                <dt>Domicilio completo (asignación confirmada)</dt>
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
              <div>
                <dt>Cliente</dt>
                <dd>
                  @if (item.clientUserId) {
                    <a [routerLink]="['/perfiles/cliente', item.clientUserId]">
                      {{ item.clientDisplayName }} (ver perfil público)
                    </a>
                  } @else {
                    {{ item.clientDisplayName }}
                  }
                </dd>
              </div>
            } @else {
              <div>
                <dt>Domicilio completo</dt>
                <dd class="muted-value">
                  Oculto por privacidad hasta que aceptes y confirmes la asignación.
                </dd>
              </div>
            }
            @if (item.scheduledStartAt) {
              <div>
                <dt>Cita programada en tu itinerario</dt>
                <dd>{{ item.scheduledStartAt | date: "dd/MM/yyyy HH:mm 'hrs'" }}</dd>
              </div>
            }
          </dl>

          <h2 style="margin: 0 0 0.75rem; font-size: 1.05rem">Fotografías del cliente</h2>
          <app-image-gallery [images]="item.images" />

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 1.35rem 0" />

          @if (item.status === 'Open') {
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center">
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="busy()"
                (click)="acceptRepair(item.id)"
              >
                {{ busy() ? 'Aceptando...' : 'Aceptar solicitud' }}
              </button>
              <span class="field-hint">
                Al aceptar, la solicitud pasará a tu itinerario, se habilitará el chat y podrás ver
                el domicilio completo.
              </span>
            </div>
          }

          @if (
            isAssignedToMe(item) && (item.status === 'Assigned' || item.status === 'Scheduled')
          ) {
            <div class="form-stack">
              <h2 style="margin: 0; font-size: 1.05rem">Programar en tu itinerario</h2>
              <form class="form-stack" (ngSubmit)="scheduleRepair(item.id)">
                <div class="field">
                  <span class="field-label">Fecha y hora de atención (formato 24 hrs) *</span>
                  <app-schedule-agenda-picker
                    [value]="scheduleInput"
                    (valueChange)="scheduleInput = $event"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="busy() || !scheduleInput"
                  >
                    {{
                      busy()
                        ? 'Guardando...'
                        : item.scheduledStartAt
                          ? 'Reprogramar cita'
                          : 'Guardar en itinerario'
                    }}
                  </button>
                </div>
              </form>

              <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.35rem 0" />

              <h2 style="margin: 0; font-size: 1.05rem">Seguimiento presencial de visita</h2>
              <form class="form-stack" (ngSubmit)="markOnTheWay(item.id)">
                <div class="field" style="max-inline-size: 16rem">
                  <label for="eta-minutes">Tiempo estimado de llegada (min)</label>
                  <input
                    id="eta-minutes"
                    name="etaMinutes"
                    type="number"
                    min="5"
                    max="180"
                    class="input-control"
                    placeholder="Ej. 20"
                    [(ngModel)]="etaMinutes"
                  />
                </div>
                <div class="visit-actions-row">
                  <button
                    type="submit"
                    class="btn btn-primary visit-action-btn"
                    [disabled]="busy()"
                  >
                    Voy en camino
                  </button>
                  <button
                    type="button"
                    class="btn btn-teal visit-action-btn"
                    [disabled]="busy()"
                    (click)="markArrived(item.id)"
                  >
                    Ya llegué al domicilio
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger visit-action-btn"
                    [disabled]="busy()"
                    (click)="openReleaseDialog()"
                  >
                    Liberar asignación
                  </button>
                </div>
              </form>
            </div>
          }

          @if (isAssignedToMe(item) && (item.status === 'OnTheWay' || item.status === 'Arrived')) {
            <div class="form-stack">
              <h2 style="margin: 0; font-size: 1.05rem">Confirmar llegada e iniciar reparación</h2>

              @if (item.status === 'OnTheWay') {
                <div class="visit-actions-row">
                  <button
                    type="button"
                    class="btn btn-primary visit-action-btn"
                    [disabled]="busy()"
                    (click)="markArrived(item.id)"
                  >
                    Ya llegué al domicilio
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger visit-action-btn"
                    [disabled]="busy()"
                    (click)="openReleaseDialog()"
                  >
                    Liberar asignación
                  </button>
                </div>
              }

              <form class="toolbar-row" (ngSubmit)="startWork(item.id)">
                @if (item.requiresArrivalPin) {
                  <div class="field" style="max-inline-size: 14rem">
                    <label for="arrival-pin-input">Código PIN del cliente (4 dígitos) *</label>
                    <input
                      id="arrival-pin-input"
                      name="arrivalPinInput"
                      type="text"
                      inputmode="numeric"
                      maxlength="4"
                      class="input-control"
                      placeholder="Ej. 4821"
                      [(ngModel)]="arrivalPinInput"
                      required
                    />
                  </div>
                }
                <button
                  type="submit"
                  class="btn btn-teal"
                  [disabled]="
                    busy() || (item.requiresArrivalPin && arrivalPinInput.trim().length !== 4)
                  "
                >
                  {{ busy() ? 'Validando...' : 'Iniciar reparación' }}
                </button>
              </form>
            </div>
          }

          @if (isAssignedToMe(item) && item.status === 'InProgress') {
            <form class="form-stack" (ngSubmit)="requestClosure(item.id)">
              <h2 style="margin: 0; font-size: 1.05rem">Seguimiento y solicitud de cierre</h2>
              <div class="field">
                <label for="closure-notes">Resumen del trabajo realizado (opcional)</label>
                <textarea
                  id="closure-notes"
                  name="closureNotes"
                  rows="3"
                  maxlength="500"
                  class="input-control"
                  placeholder="Ej. Se limpió el drenaje y se probó el ciclo completo de centrifugado."
                  [(ngModel)]="closureNotes"
                ></textarea>
              </div>
              <div>
                <button type="submit" class="btn btn-primary" [disabled]="busy()">
                  {{ busy() ? 'Enviando...' : 'Solicitar confirmación de cierre al cliente' }}
                </button>
              </div>
            </form>
          }

          @if (isAssignedToMe(item) && item.status === 'ClosureRequested') {
            <div class="alert alert-info">
              Ya solicitaste el cierre del servicio. Quedará marcado como
              <strong>Completado</strong> en cuanto el cliente lo confirme.
            </div>
          }

          @if (item.status === 'Completed') {
            <div class="alert alert-success">
              Servicio confirmado como <strong>Completado</strong> por el cliente el
              {{ item.completedAt | date: "dd/MM/yyyy HH:mm 'hrs'" }}.
            </div>
          }
        </section>

        <dialog #releaseDialog aria-labelledby="release-repair-title">
          <h1 id="release-repair-title" class="page-title" style="font-size: 1.2rem">
            Liberar asignación de servicio
          </h1>
          <p style="margin: 0 0 0.85rem; color: var(--th-text-muted)">
            La solicitud volverá al tablón para que otro técnico pueda atenderla y notificaremos al
            cliente.
          </p>
          <div class="field" style="margin-bottom: 1rem">
            <label for="release-reason">Motivo (mín. 5 caracteres) *</label>
            <textarea
              id="release-reason"
              name="releaseReason"
              rows="3"
              maxlength="300"
              class="input-control"
              placeholder="Ej. Surge imprevisto en ruta y no puedo cubrir el horario acordado."
              [(ngModel)]="releaseReason"
            ></textarea>
          </div>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <button
              type="button"
              class="btn btn-secondary"
              autofocus
              (click)="closeReleaseDialog()"
            >
              Volver
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [disabled]="busy() || releaseReason.trim().length < 5"
              (click)="confirmRelease(item.id)"
            >
              {{ busy() ? 'Liberando...' : 'Sí, liberar asignación' }}
            </button>
          </div>
        </dialog>
      }
    </app-shell>
  `,
})
export class TechnicianRepairDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repairs = inject(RepairsService);
  private readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly releaseDialogRef = viewChild<ElementRef<HTMLDialogElement>>('releaseDialog');

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly openingChat = signal(false);
  protected readonly repair = signal<RepairDetailDto | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly feedbackMessage = signal<string | null>(null);
  protected readonly overlapWarning = signal<OverlappingAppointmentDto[]>([]);

  protected scheduleInput = '';
  protected etaMinutes: number | null = 20;
  protected arrivalPinInput = '';
  protected closureNotes = '';
  protected releaseReason = '';

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
        if (data.scheduledStartAt) {
          this.scheduleInput = this.toLocalDateTimeInput(data.scheduledStartAt);
        }
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected isAssignedToMe(item: RepairDetailDto): boolean {
    return item.assignedTechnicianId === this.auth.user()?.id;
  }

  protected acceptRepair(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.accept(id).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.feedbackMessage.set(
          'Solicitud aceptada. Ahora puedes consultar el domicilio completo, chatear con el cliente y programar la cita.',
        );
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected scheduleRepair(id: string): void {
    if (!this.scheduleInput) {
      return;
    }

    const iso = new Date(this.scheduleInput).toISOString();
    this.busy.set(true);
    this.errorMessage.set(null);
    this.overlapWarning.set([]);
    this.repairs.schedule(id, iso).subscribe({
      next: (res) => {
        this.busy.set(false);
        this.repair.set(res.repair);
        this.overlapWarning.set(res.hasScheduleOverlap ? res.overlappingAppointments : []);
        this.feedbackMessage.set('Cita programada correctamente en tu itinerario.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected markOnTheWay(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.markOnTheWay(id, this.etaMinutes ? Number(this.etaMinutes) : null).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.feedbackMessage.set(
          'Avisamos al cliente que vas en camino y generamos su código PIN de llegada.',
        );
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected markArrived(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.markArrived(id).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.feedbackMessage.set(
          'Llegada confirmada. Solicita al cliente su código PIN de 4 dígitos para iniciar la reparación.',
        );
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected startWork(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.startWork(id, this.arrivalPinInput).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.arrivalPinInput = '';
        this.repair.set(updated);
        this.feedbackMessage.set('Llegada verificada. Servicio marcado En proceso.');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected requestClosure(id: string): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.requestClosure(id, this.closureNotes.trim() || null).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.repair.set(updated);
        this.feedbackMessage.set(
          'Cierre solicitado. Esperando confirmación del cliente para finalizar.',
        );
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected openReleaseDialog(): void {
    this.releaseReason = '';
    this.releaseDialogRef()?.nativeElement.showModal();
  }

  protected closeReleaseDialog(): void {
    this.releaseDialogRef()?.nativeElement.close();
  }

  protected confirmRelease(id: string): void {
    if (this.releaseReason.trim().length < 5) {
      return;
    }

    this.busy.set(true);
    this.errorMessage.set(null);
    this.repairs.releaseAssignment(id, this.releaseReason.trim()).subscribe({
      next: () => {
        this.busy.set(false);
        this.closeReleaseDialog();
        void this.router.navigateByUrl('/tecnico');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.closeReleaseDialog();
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

  private toLocalDateTimeInput(isoUtc: string): string {
    const d = new Date(isoUtc);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
