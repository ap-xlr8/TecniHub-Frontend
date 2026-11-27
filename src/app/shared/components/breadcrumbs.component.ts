import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../core/ui/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  imports: [RouterLink],
  template: `
    @if (breadcrumbs.items().length > 0) {
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <ol class="breadcrumbs-list">
          @for (crumb of breadcrumbs.items(); track crumb.label + $index; let last = $last) {
            <li class="breadcrumbs-item">
              @if (!last && crumb.url) {
                <a [routerLink]="crumb.url" class="breadcrumbs-link">{{ crumb.label }}</a>
                <span class="breadcrumbs-sep" aria-hidden="true">›</span>
              } @else {
                <span class="breadcrumbs-current" aria-current="page">{{ crumb.label }}</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class BreadcrumbsComponent {
  protected readonly breadcrumbs = inject(BreadcrumbService);
}
