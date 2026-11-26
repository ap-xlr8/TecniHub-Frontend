import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="status-badge" [class]="variantClass()">
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly code = input.required<string>();
  readonly label = input.required<string>();

  protected readonly variantClass = computed(() => {
    switch (this.code()) {
      case 'Open':
      case 'Available':
        return 'status-badge--open';
      case 'Assigned':
      case 'Scheduled':
        return 'status-badge--assigned';
      case 'OnTheWay':
      case 'Arrived':
        return 'status-badge--transit';
      case 'InProgress':
        return 'status-badge--progress';
      case 'ClosureRequested':
        return 'status-badge--closure';
      case 'Completed':
        return 'status-badge--completed';
      default:
        return 'status-badge--muted';
    }
  });
}
