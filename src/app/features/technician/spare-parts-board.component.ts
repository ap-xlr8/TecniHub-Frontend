import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SparePartSummaryDto } from '../../core/models/operations.models';
import { SparePartsService } from '../../core/services/spare-parts.service';
import { FALLBACK_IMAGE_DATA_URI } from '../../shared/components/image-uploader-cropper.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-spare-parts-board',
  imports: [AppShellComponent, RouterLink, FormsModule, StatusBadgeComponent, CurrencyPipe],
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
            <div class="field" style="max-inline-size: 13rem">
              <label for="sp-modality">Modalidad</label>
              <select id="sp-modality" name="modality" class="input-control" [(ngModel)]="modality">
                <option value="">Todas</option>
                <option value="Sale">Venta</option>
                <option value="Exchange">Intercambio</option>
                <option value="SaleOrExchange">Venta o intercambio</option>
              </select>
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
                @if (part.thumbnailUrl) {
                  <img
                    class="item-card-thumb"
                    [src]="part.thumbnailUrl"
                    [alt]="'Foto de ' + part.title"
                    loading="lazy"
                    (error)="onImgError($event)"
                  />
                }

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
      }
    </app-shell>
  `,
})
export class SparePartsBoardComponent implements OnInit {
  private readonly spareParts = inject(SparePartsService);
  private readonly auth = inject(AuthService);

  protected readonly tab = signal<'board' | 'mine'>('board');
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly items = signal<SparePartSummaryDto[]>([]);

  protected search = '';
  protected modality = '';

  ngOnInit(): void {
    this.loadCurrentTab();
  }

  protected switchTab(next: 'board' | 'mine'): void {
    this.tab.set(next);
    this.loadCurrentTab();
  }

  protected loadCurrentTab(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const request$ =
      this.tab() === 'board'
        ? this.spareParts.getAvailable({ search: this.search, modality: this.modality })
        : this.spareParts.getMine();

    request$.subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_IMAGE_DATA_URI) {
      img.src = FALLBACK_IMAGE_DATA_URI;
    }
  }
}
