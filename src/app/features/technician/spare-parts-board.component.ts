import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SparePartSummaryDto } from '../../core/models/operations.models';
import { SparePartsService } from '../../core/services/spare-parts.service';
import { ImageCarouselComponent } from '../../shared/components/image-carousel.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-spare-parts-board',
  imports: [
    AppShellComponent,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    ImageCarouselComponent,
    PaginationComponent,
    CurrencyPipe,
  ],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="spare-board-heading">
        <div class="page-header-row">
          <div>
            <h1 id="spare-board-heading" class="page-title">Tablón de refacciones</h1>
            <p class="page-lead" style="margin: 0">
              Espacio exclusivo entre técnicos para publicar y consultar piezas en venta o
              intercambio. El pago y la entrega se acuerdan fuera de TECNIHUB.
            </p>
          </div>
          <a routerLink="/tecnico/refacciones/nueva" class="btn btn-primary">
            + Publicar refacción
          </a>
        </div>

        <div class="tab-bar" style="margin-top: 1rem">
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'board'"
            (click)="switchTab('board')"
          >
            Disponibles
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.tab-btn--active]="tab() === 'mine'"
            (click)="switchTab('mine')"
          >
            Mis refacciones
          </button>
        </div>

        @if (tab() === 'board') {
          <form class="toolbar-row" style="margin-top: 1rem" (ngSubmit)="loadCurrentTab()">
            <div class="field">
              <label for="sp-search">Buscar pieza, compatibilidad o categoría</label>
              <input
                id="sp-search"
                name="search"
                type="search"
                class="input-control"
                placeholder="Ej. Termostato, Bomba, Tarjeta electrónica"
                [(ngModel)]="search"
              />
            </div>
            <div class="field" style="max-inline-size: 11rem">
              <label for="sp-modality">Modalidad</label>
              <select id="sp-modality" name="modality" class="input-control" [(ngModel)]="modality">
                <option value="">Todas</option>
                <option value="Sale">Venta</option>
                <option value="Exchange">Intercambio</option>
                <option value="SaleOrExchange">Venta o intercambio</option>
              </select>
            </div>
            <div class="field" style="max-inline-size: 10rem">
              <label for="sp-condition-filter">Condición</label>
              <select
                id="sp-condition-filter"
                name="condition"
                class="input-control"
                [(ngModel)]="condition"
              >
                <option value="">Todas</option>
                <option value="New">Nueva</option>
                <option value="Used">Usada</option>
                <option value="Refurbished">Reacondicionada</option>
              </select>
            </div>
            <div class="field" style="max-inline-size: 8.5rem">
              <label for="sp-min-price">Mín. MXN</label>
              <input
                id="sp-min-price"
                name="minPrice"
                type="number"
                min="0"
                class="input-control"
                placeholder="0"
                [(ngModel)]="minPrice"
              />
            </div>
            <div class="field" style="max-inline-size: 8.5rem">
              <label for="sp-max-price">Máx. MXN</label>
              <input
                id="sp-max-price"
                name="maxPrice"
                type="number"
                min="0"
                class="input-control"
                placeholder="5000"
                [(ngModel)]="maxPrice"
              />
            </div>
            <button type="submit" class="btn btn-primary">Filtrar</button>
          </form>
        }
      </section>

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (loading()) {
        <section class="panel-card"><p class="muted-value">Cargando refacciones...</p></section>
      } @else if (items().length === 0) {
        <section class="empty-state">
          <h2>
            {{
              tab() === 'board'
                ? 'No hay refacciones disponibles'
                : 'Aún no has publicado refacciones'
            }}
          </h2>
          <p>
            {{
              tab() === 'board'
                ? 'No se encontraron piezas activas con ese filtro.'
                : 'Publica piezas nuevas, usadas o reacondicionadas para que otros técnicos te contacten.'
            }}
          </p>
          <a routerLink="/tecnico/refacciones/nueva" class="btn btn-primary">
            Publicar refacción
          </a>
        </section>
      } @else {
        <section class="card-list" aria-label="Listado de refacciones">
          @for (part of items(); track part.id) {
            <article class="item-card">
              <div style="display: grid; gap: 0.6rem">
                <app-image-carousel
                  [images]="part.imageUrls"
                  [fallbackThumbnail]="part.thumbnailUrl"
                  [altPrefix]="'Foto de ' + part.title"
                />

                <div
                  style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem"
                >
                  <h2 style="margin: 0; font-size: 1.08rem">{{ part.title }}</h2>
                  <app-status-badge
                    [code]="part.isAvailable ? 'Available' : 'Unavailable'"
                    [label]="part.availabilityLabel"
                  />
                </div>

                <div class="price-tag">
                  {{ part.priceMxn | currency: 'MXN' : 'symbol-narrow' : '1.2-2' }} MXN
                </div>

                <p style="margin: 0; font-size: 0.92rem">{{ part.descriptionSummary }}</p>

                <div class="item-card-meta">
                  <span><strong>Categoría:</strong> {{ part.applianceCategory }}</span>
                  <span>
                    <strong>Condición:</strong> {{ part.conditionLabel }} ·
                    <strong>Modalidad:</strong> {{ part.modalityLabel }}
                  </span>
                  <span><strong>Oferente:</strong> {{ part.technicianDisplayName }}</span>
                </div>
              </div>

              <div class="item-card-actions">
                <a [routerLink]="['/tecnico/refacciones', part.id]" class="btn btn-primary btn-sm">
                  Ver detalle y contactar
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
    </app-shell>
  `,
})
export class SparePartsBoardComponent implements OnInit {
  private readonly spareParts = inject(SparePartsService);
  private readonly auth = inject(AuthService);

  protected readonly pageSize = 30;
  protected readonly tab = signal<'board' | 'mine'>('board');
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly items = signal<SparePartSummaryDto[]>([]);
  protected readonly page = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);

  protected search = '';
  protected modality = '';
  protected condition = '';
  protected minPrice: number | null = null;
  protected maxPrice: number | null = null;

  ngOnInit(): void {
    this.loadCurrentTab(1);
  }

  protected switchTab(next: 'board' | 'mine'): void {
    this.tab.set(next);
    this.loadCurrentTab(1);
  }

  protected onPageChange(nextPage: number): void {
    this.loadCurrentTab(nextPage);
  }

  protected loadCurrentTab(targetPage = 1): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const request$ =
      this.tab() === 'board'
        ? this.spareParts.getAvailable({
            search: this.search,
            modality: this.modality,
            condition: this.condition,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            page: targetPage,
            pageSize: this.pageSize,
          })
        : this.spareParts.getMine({ page: targetPage, pageSize: this.pageSize });

    request$.subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.page.set(res.page);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }
}
