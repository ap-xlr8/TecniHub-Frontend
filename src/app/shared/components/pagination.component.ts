import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalCount() > 0) {
      <nav class="pagination-bar" aria-label="Paginación de resultados">
        <p class="pagination-summary">
          Mostrando <strong>{{ rangeStart() }}–{{ rangeEnd() }}</strong> de
          <strong>{{ totalCount() }}</strong>
        </p>

        @if (totalPages() > 1) {
          <div class="pagination-controls">
            <button
              type="button"
              class="btn btn-secondary btn-sm pagination-btn"
              [disabled]="page() <= 1"
              (click)="selectPage(page() - 1)"
            >
              Anterior
            </button>

            @for (entry of visiblePages(); track entry + '-' + $index) {
              @if (entry === 'ellipsis') {
                <span class="pagination-ellipsis" aria-hidden="true">…</span>
              } @else {
                <button
                  type="button"
                  class="btn btn-sm pagination-btn"
                  [class.btn-primary]="entry === page()"
                  [class.btn-secondary]="entry !== page()"
                  [attr.aria-current]="entry === page() ? 'page' : null"
                  [attr.aria-label]="'Página ' + entry"
                  (click)="selectPage(entry)"
                >
                  {{ entry }}
                </button>
              }
            }

            <button
              type="button"
              class="btn btn-secondary btn-sm pagination-btn"
              [disabled]="page() >= totalPages()"
              (click)="selectPage(page() + 1)"
            >
              Siguiente
            </button>
          </div>
        }
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly rangeStart = computed(() =>
    this.totalCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.totalCount()),
  );

  protected readonly visiblePages = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, idx) => idx + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) {
      pages.push('ellipsis');
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (end < total - 1) {
      pages.push('ellipsis');
    }
    pages.push(total);
    return pages;
  });

  protected selectPage(next: number): void {
    if (next < 1 || next > this.totalPages() || next === this.page()) {
      return;
    }
    this.pageChange.emit(next);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
