import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RepairDetailDto } from '../../core/models/operations.models';

interface TimelineStep {
  key: string;
  label: string;
  timestamp: string | null | undefined;
  done: boolean;
  active: boolean;
}

@Component({
  selector: 'app-repair-timeline',
  imports: [DatePipe],
  template: `
    <section class="timeline-box" aria-label="Seguimiento del servicio">
      <h2 class="timeline-title">Seguimiento del servicio</h2>

      @if (repair().status === 'Cancelled') {
        <div class="alert alert-error" style="margin: 0">
          <strong>Solicitud cancelada</strong>
          @if (repair().cancelledAt) {
            el {{ repair().cancelledAt | date: "dd/MM/yyyy HH:mm 'hrs'" }}
          }
          @if (repair().cancellationReason) {
            <p style="margin: 0.35rem 0 0">Motivo: {{ repair().cancellationReason }}</p>
          }
        </div>
      } @else {
        <ol class="timeline-steps">
          @for (step of steps(); track step.key) {
            <li
              class="timeline-step"
              [class.timeline-step--done]="step.done"
              [class.timeline-step--active]="step.active"
            >
              <span class="timeline-dot" aria-hidden="true">{{
                step.done ? '✓' : $index + 1
              }}</span>
              <div class="timeline-step-body">
                <strong>{{ step.label }}</strong>
                @if (step.timestamp) {
                  <div class="field-hint">{{ step.timestamp | date: 'dd/MM/yyyy HH:mm' }}</div>
                }
              </div>
            </li>
          }
        </ol>

        @if (repair().status === 'OnTheWay' && repair().estimatedArrivalMinutes) {
          <div class="alert alert-info" style="margin-top: 0.75rem">
            El técnico va en camino. Tiempo estimado de llegada:
            <strong>~{{ repair().estimatedArrivalMinutes }} minutos</strong>.
          </div>
        }

        @if (repair().clientArrivalPin; as pin) {
          <div class="pin-card" role="status" aria-live="polite">
            <div>
              <p class="pin-card-title">Código de verificación de llegada presencial</p>
              <p class="field-hint" style="margin: 0">
                Comparte este código de 4 dígitos únicamente cuando el técnico llegue a tu domicilio
                para iniciar la reparación.
              </p>
            </div>
            <span class="pin-code" data-testid="client-arrival-pin">{{ pin }}</span>
          </div>
        }

        @if (repair().closureRejectionReason && repair().status === 'InProgress') {
          <div class="alert alert-error" style="margin-top: 0.75rem">
            <strong>Pendiente reportado por el cliente:</strong>
            {{ repair().closureRejectionReason }}
          </div>
        }
      }
    </section>
  `,
})
export class RepairTimelineComponent {
  readonly repair = input.required<RepairDetailDto>();

  protected readonly steps = computed<TimelineStep[]>(() => {
    const r = this.repair();
    const order: Record<string, number> = {
      Open: 0,
      Assigned: 1,
      Scheduled: 2,
      OnTheWay: 3,
      Arrived: 4,
      InProgress: 5,
      ClosureRequested: 6,
      Completed: 7,
    };
    const current = order[r.status] ?? 0;

    return [
      {
        key: 'open',
        label: 'Publicada',
        timestamp: r.createdAt,
        done: current >= 0,
        active: current === 0,
      },
      {
        key: 'assigned',
        label: 'Aceptada',
        timestamp: r.assignedAt,
        done: current >= 1,
        active: current === 1,
      },
      {
        key: 'scheduled',
        label: 'Cita programada',
        timestamp: r.scheduledStartAt,
        done: current >= 2 && Boolean(r.scheduledStartAt),
        active: current === 2,
      },
      {
        key: 'onTheWay',
        label: 'En camino',
        timestamp: r.enRouteAt,
        done: current >= 3 && Boolean(r.enRouteAt),
        active: current === 3,
      },
      {
        key: 'arrived',
        label: 'En el domicilio',
        timestamp: r.arrivedAt,
        done: current >= 4 && Boolean(r.arrivedAt),
        active: current === 4,
      },
      {
        key: 'inProgress',
        label: 'En proceso',
        timestamp: r.startedAt,
        done: current >= 5,
        active: current === 5,
      },
      {
        key: 'closure',
        label: 'Cierre solicitado',
        timestamp: r.closureRequestedAt,
        done: current >= 6,
        active: current === 6,
      },
      {
        key: 'completed',
        label: 'Completado',
        timestamp: r.completedAt,
        done: current >= 7,
        active: current === 7,
      },
    ];
  });
}
