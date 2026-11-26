import { Injectable, computed, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoadingStateService {
  private readonly router = inject(Router);
  private readonly navigating = signal(false);
  private readonly activeHttpRequests = signal(0);
  private readonly pulseVisible = signal(false);
  private pulseTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isLoading = computed(
    () => this.navigating() || this.activeHttpRequests() > 0 || this.pulseVisible(),
  );

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigating.set(true);
        this.triggerMinimumPulse();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navigating.set(false);
      }
    });
  }

  beginHttpRequest(): void {
    this.activeHttpRequests.update((c) => c + 1);
  }

  endHttpRequest(): void {
    this.activeHttpRequests.update((c) => Math.max(0, c - 1));
  }

  private triggerMinimumPulse(): void {
    this.pulseVisible.set(true);
    if (this.pulseTimer !== null) {
      clearTimeout(this.pulseTimer);
    }
    this.pulseTimer = setTimeout(() => {
      this.pulseVisible.set(false);
      this.pulseTimer = null;
    }, 260);
  }
}
