import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ItineraryItemDto } from '../../core/models/operations.models';
import { RepairsService } from '../../core/services/repairs.service';
import { ImageCarouselComponent } from '../../shared/components/image-carousel.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-technician-itinerary',
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
      <section class="panel-card" aria-labelledby="itinerary-heading">
        <div class="page-header-row">
          <div>
            <h1 id="itinerary-heading" class="page-title">Mi itinerario técnico</h1>
            <p class="page-lead" style="margin: 0">
              Agenda privada de tus servicios aceptados en orden cronológico, con domicilio completo
              para los trabajos confirmados.
            </p>
          </div>
          <a routerLink="/tecnico" class="btn btn-secondary">Ver tablón disponible</a>
        </div>
      </section>

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando itinerario...</p></section>
      } @else if (activeCount() + completedCount() === 0) {
        <section class="empty-state">
          <h2>Aún no tienes servicios en tu itinerario</h2>
          <p>
            Acepta una solicitud desde el tablón de servicios para programarla aquí y consultar el
            domicilio completo.
          </p>
          <a routerLink="/tecnico" class="btn btn-primary">Explorar tablón de servicios</a>
        </section>
      } @else {
        <div class="tab-bar">
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'active'"
            (click)="switchTab('active')"
          >
            Pendientes y activos ({{ activeCount() }})
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'completed'"
            (click)="switchTab('completed')"
          >
            Completados ({{ completedCount() }})
          </button>
        </div>

        @if (items().length === 0) {
          <section class="empty-state">
            <h2>No hay servicios en esta sección</h2>
          </section>
        } @else {
          <section class="card-list" aria-label="Servicios en itinerario">
            @for (item of items(); track item.id) {
              <article class="item-card">
                <div style="display: grid; gap: 0.55rem">
                  <app-image-carousel
                    [images]="item.imageUrls"
                    [fallbackThumbnail]="item.thumbnailUrl"
                    [altPrefix]="'Fotografía de ' + item.applianceName"
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

                  @if (item.hasScheduleOverlap) {
                    <div
                      class="alert alert-info"
                      style="padding: 0.5rem 0.75rem; font-size: 0.84rem"
                    >
                      <strong>Traslape detectado:</strong> Coincide en ±60 min con otro servicio de
                      tu agenda.
                    </div>
                  }

                  <div class="item-card-meta">
                    <span><strong>Cliente:</strong> {{ item.clientDisplayName }}</span>
                    <span>
                      <strong>Cita programada:</strong>
                      @if (item.scheduledStartAt) {
                        {{ item.scheduledStartAt | date: "dd/MM/yyyy HH:mm 'hrs'" }}
                      } @else {
                        Sin fecha programada aún (Preferencia: {{ item.preferredDate }} ·
                        {{ item.preferredTimeSlot }})
                      }
                    </span>
                    <span>
                      <strong>Domicilio:</strong> {{ item.fullAddress.street }}
                      @if (item.fullAddress.exteriorNumber) {
                        #{{ item.fullAddress.exteriorNumber }}
                      }
                      @if (item.fullAddress.interiorNumber) {
                        Int. {{ item.fullAddress.interiorNumber }}
                      }
                      , {{ item.location.neighborhood }}, {{ item.location.municipality }} (CP
                      {{ item.location.postalCode }})
                    </span>
                  </div>
                </div>

                <div class="item-card-actions">
                  <a [routerLink]="['/tecnico/servicios', item.id]" class="btn btn-primary btn-sm">
                    {{
                      item.scheduledStartAt ? 'Abrir seguimiento' : 'Programar y dar seguimiento'
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
export class TechnicianItineraryComponent implements OnInit {
  private readonly repairs = inject(RepairsService);
  private readonly auth = inject(AuthService);

  protected readonly pageSize = 12;
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly items = signal<ItineraryItemDto[]>([]);
  protected readonly tab = signal<'active' | 'completed'>('active');
  protected readonly page = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly activeCount = signal(0);
  protected readonly completedCount = signal(0);

  ngOnInit(): void {
    this.loadItinerary(1);
  }

  protected switchTab(next: 'active' | 'completed'): void {
    if (this.tab() === next) {
      return;
    }
    this.tab.set(next);
    this.loadItinerary(1);
  }

  protected onPageChange(nextPage: number): void {
    this.loadItinerary(nextPage);
  }

  private loadItinerary(targetPage: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.repairs
      .getItinerary({ scope: this.tab(), page: targetPage, pageSize: this.pageSize })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.page.set(res.page);
          this.totalCount.set(res.totalCount);
          this.totalPages.set(res.totalPages);
          this.activeCount.set(res.activeCount ?? res.totalCount);
          this.completedCount.set(res.secondaryCount ?? 0);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }
}
