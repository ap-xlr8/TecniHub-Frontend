import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ClientRepairSummaryDto } from '../../core/models/operations.models';
import { RepairsService } from '../../core/services/repairs.service';
import { ImageCarouselComponent } from '../../shared/components/image-carousel.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    AppShellComponent,
    RouterLink,
    StatusBadgeComponent,
    ImageCarouselComponent,
    PaginationComponent,
    DatePipe,
  ],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="client-welcome">
        <div class="page-header-row">
          <div>
            <h1 id="client-welcome" class="page-title">
              Hola, {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}
            </h1>
            <p class="page-lead" style="margin: 0">
              Consulta el estado de tus solicitudes de reparación o publica una nueva necesidad.
            </p>
          </div>
          <a routerLink="/cliente/nueva-solicitud" class="btn btn-primary">
            + Publicar reparación
          </a>
        </div>
      </section>

      @if (closurePendingCount() > 0) {
        <div class="alert alert-info" role="status">
          Tienes <strong>{{ closurePendingCount() }}</strong> reparación(es) con
          <strong>Cierre solicitado</strong> esperando tu confirmación para pasar a Completado.
        </div>
      }

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (loading()) {
        <section class="panel-card">
          <p class="muted-value" style="margin: 0">Cargando tus solicitudes...</p>
        </section>
      } @else if (activeCount() + historyCount() === 0) {
        <section class="empty-state" aria-label="Sin solicitudes">
          <h2>Aún no tienes solicitudes</h2>
          <p>
            Publica el electrodoméstico que necesita atención, describe la falla e indica tu horario
            preferido para que un técnico disponible pueda atenderte.
          </p>
          <a routerLink="/cliente/nueva-solicitud" class="btn btn-primary">
            Publicar mi primera reparación
          </a>
        </section>
      } @else {
        <div class="tab-bar" role="tablist" aria-label="Filtro de solicitudes">
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'active'"
            (click)="switchTab('active')"
          >
            Activas ({{ activeCount() }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'history'"
            (click)="switchTab('history')"
          >
            Historial ({{ historyCount() }})
          </button>
        </div>

        @if (requests().length === 0) {
          <section class="empty-state">
            <h2>
              {{
                tab() === 'active'
                  ? 'No tienes solicitudes activas en este momento'
                  : 'Todavía no tienes solicitudes completadas o canceladas'
              }}
            </h2>
          </section>
        } @else {
          <section class="card-list" aria-label="Listado de solicitudes">
            @for (item of requests(); track item.id) {
              <article class="item-card">
                <div style="display: grid; gap: 0.6rem">
                  <app-image-carousel
                    [images]="item.imageUrls"
                    [fallbackThumbnail]="item.thumbnailUrl"
                    [altPrefix]="'Foto de ' + item.applianceName"
                  />

                  <div
                    style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem"
                  >
                    <div>
                      <h2 style="margin: 0; font-size: 1.08rem">{{ item.applianceName }}</h2>
                      @if (item.brandModel) {
                        <p class="field-hint">{{ item.brandModel }}</p>
                      }
                    </div>
                    <app-status-badge [code]="item.status" [label]="item.statusLabel" />
                  </div>

                  <p style="margin: 0; font-size: 0.92rem">{{ item.issueSummary }}</p>

                  <div class="item-card-meta">
                    <span>
                      <strong>Zona:</strong> {{ item.location.neighborhood }},
                      {{ item.location.municipality }} (CP {{ item.location.postalCode }})
                    </span>
                    <span>
                      <strong>Preferencia:</strong> {{ item.preferredDate }} ·
                      {{ item.preferredTimeSlot }}
                    </span>
                    @if (item.assignedTechnicianName) {
                      <span
                        ><strong>Técnico asignado:</strong> {{ item.assignedTechnicianName }}</span
                      >
                    }
                    @if (item.scheduledStartAt) {
                      <span>
                        <strong>Cita programada:</strong>
                        {{ item.scheduledStartAt | date: 'medium' }}
                      </span>
                    }
                  </div>
                </div>

                <div class="item-card-actions">
                  <a
                    [routerLink]="['/cliente/solicitudes', item.id]"
                    class="btn btn-sm"
                    [class.btn-primary]="item.status === 'ClosureRequested'"
                    [class.btn-secondary]="item.status !== 'ClosureRequested'"
                  >
                    {{
                      item.status === 'ClosureRequested'
                        ? 'Revisar y confirmar cierre'
                        : 'Ver detalle'
                    }}
                  </a>
                </div>
              </article>
            }
          </section>

          <app-pagination
            [page]="page()"
            [pageSize]="pageSize"
            [totalCount]="totalCount()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </app-shell>
  `,
})
export class ClientDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly repairsService = inject(RepairsService);

  protected readonly pageSize = 12;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly requests = signal<ClientRepairSummaryDto[]>([]);
  protected readonly tab = signal<'active' | 'history'>('active');
  protected readonly page = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly activeCount = signal(0);
  protected readonly historyCount = signal(0);
  protected readonly closurePendingCount = signal(0);

  ngOnInit(): void {
    this.loadRequests(1);
  }

  protected switchTab(next: 'active' | 'history'): void {
    if (this.tab() === next) {
      return;
    }
    this.tab.set(next);
    this.loadRequests(1);
  }

  protected onPageChange(nextPage: number): void {
    this.loadRequests(nextPage);
  }

  private loadRequests(targetPage: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.repairsService
      .getMine({ scope: this.tab(), page: targetPage, pageSize: this.pageSize })
      .subscribe({
        next: (res) => {
          this.requests.set(res.items);
          this.page.set(res.page);
          this.totalCount.set(res.totalCount);
          this.totalPages.set(res.totalPages);
          this.activeCount.set(res.activeCount ?? res.totalCount);
          this.historyCount.set(res.secondaryCount ?? 0);
          this.closurePendingCount.set(res.pendingClosureCount ?? 0);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }
}
