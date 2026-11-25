import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { OpenRepairBoardItemDto } from '../../core/models/operations.models';
import { RepairsService } from '../../core/services/repairs.service';
import { FALLBACK_IMAGE_DATA_URI } from '../../shared/components/image-uploader-cropper.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-technician-dashboard',
  imports: [AppShellComponent, RouterLink, FormsModule, StatusBadgeComponent],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="tech-board-heading">
        <div class="page-header-row">
          <div>
            <h1 id="tech-board-heading" class="page-title">Tablón de servicios</h1>
            <p class="page-lead" style="margin: 0">
              Solicitudes de reparación disponibles. Por privacidad, la ubicación se muestra hasta
              colonia hasta que aceptes y confirmes la asignación.
            </p>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
            <a routerLink="/tecnico/itinerario" class="btn btn-secondary btn-sm">Mi itinerario</a>
            <a routerLink="/tecnico/refacciones" class="btn btn-teal btn-sm">Ver refacciones</a>
          </div>
        </div>

        <form class="toolbar-row" style="margin-top: 1rem" (ngSubmit)="loadBoard()">
          <div class="field">
            <label for="board-search">Buscar por aparato, falla, colonia o código postal</label>
            <input
              id="board-search"
              name="searchTerm"
              type="search"
              class="input-control"
              placeholder="Ej. Lavadora, Refrigerador, Centro, 42800"
              [(ngModel)]="searchTerm"
            />
          </div>
          <button type="submit" class="btn btn-primary">Buscar</button>
          @if (searchTerm.trim()) {
            <button type="button" class="btn btn-secondary" (click)="clearSearch()">Limpiar</button>
          }
        </form>
      </section>

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (loading()) {
        <section class="panel-card">
          <p class="muted-value" style="margin: 0">Cargando solicitudes disponibles...</p>
        </section>
      } @else if (items().length === 0) {
        <section class="empty-state" aria-label="Tablón vacío">
          <h2>No hay solicitudes disponibles</h2>
          <p>
            No encontramos reparaciones abiertas con los criterios actuales. Vuelve a consultar más
            tarde o revisa tu itinerario.
          </p>
          <a routerLink="/tecnico/itinerario" class="btn btn-secondary">Ir a mi itinerario</a>
        </section>
      } @else {
        <section class="card-list" aria-label="Solicitudes abiertas">
          @for (item of items(); track item.id) {
            <article class="item-card">
              <div style="display: grid; gap: 0.6rem">
                @if (item.thumbnailUrl) {
                  <img
                    class="item-card-thumb"
                    [src]="item.thumbnailUrl"
                    [alt]="'Foto de ' + item.applianceName"
                    loading="lazy"
                    (error)="onImgError($event)"
                  />
                }

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
                    <strong>Ubicación (hasta colonia):</strong> {{ item.location.neighborhood }},
                    {{ item.location.municipality }}, {{ item.location.state }} (CP
                    {{ item.location.postalCode }})
                  </span>
                  <span>
                    <strong>Preferencia del cliente:</strong> {{ item.preferredDate }} ·
                    {{ item.preferredTimeSlot }}
                  </span>
                  <span><strong>Fotografías:</strong> {{ item.imageCount }}</span>
                </div>
              </div>

              <div class="item-card-actions">
                <a [routerLink]="['/tecnico/servicios', item.id]" class="btn btn-primary btn-sm">
                  Ver detalle y aceptar
                </a>
              </div>
            </article>
          }
        </section>
      }
    </app-shell>
  `,
})
export class TechnicianDashboardComponent implements OnInit {
  private readonly repairs = inject(RepairsService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly items = signal<OpenRepairBoardItemDto[]>([]);
  protected searchTerm = '';

  ngOnInit(): void {
    this.loadBoard();
  }

  protected loadBoard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.repairs.getOpenBoard(this.searchTerm).subscribe({
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

  protected clearSearch(): void {
    this.searchTerm = '';
    this.loadBoard();
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_IMAGE_DATA_URI) {
      img.src = FALLBACK_IMAGE_DATA_URI;
    }
  }
}
