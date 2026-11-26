import { Component, computed, input, signal } from '@angular/core';
import { FALLBACK_IMAGE_DATA_URI } from './image-uploader-cropper.component';

@Component({
  selector: 'app-image-carousel',
  template: `
    @if (normalizedImages().length > 0) {
      <div class="carousel-box" [attr.aria-label]="ariaLabel()">
        <img
          class="carousel-img"
          [src]="currentImage()"
          [alt]="altPrefix() + ' (' + (index() + 1) + ' de ' + normalizedImages().length + ')'"
          loading="lazy"
          (error)="onImgError($event)"
        />

        @if (normalizedImages().length > 1) {
          <button
            type="button"
            class="carousel-nav carousel-nav--prev"
            aria-label="Fotografía anterior"
            (click)="prev($event)"
          >
            ‹
          </button>
          <button
            type="button"
            class="carousel-nav carousel-nav--next"
            aria-label="Fotografía siguiente"
            (click)="next($event)"
          >
            ›
          </button>
          <span class="carousel-counter" aria-live="polite">
            {{ index() + 1 }} / {{ normalizedImages().length }}
          </span>
        }
      </div>
    } @else {
      <div class="image-placeholder-card" role="img" aria-label="Sin fotografías de referencia">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5L5 19" />
        </svg>
        <span>Sin fotografías de referencia</span>
      </div>
    }
  `,
})
export class ImageCarouselComponent {
  readonly images = input<readonly string[] | null | undefined>([]);
  readonly fallbackThumbnail = input<string | null | undefined>(null);
  readonly altPrefix = input('Fotografía de referencia');
  readonly ariaLabel = input('Carrusel de fotografías de referencia');

  protected readonly index = signal(0);

  protected readonly normalizedImages = computed(() => {
    const list = (this.images() ?? []).filter((u) => Boolean(u?.trim()));
    if (list.length > 0) {
      return list;
    }
    const thumb = this.fallbackThumbnail();
    return thumb ? [thumb] : [];
  });

  protected readonly currentImage = computed(() => {
    const list = this.normalizedImages();
    if (list.length === 0) {
      return FALLBACK_IMAGE_DATA_URI;
    }
    const safeIdx = this.index() % list.length;
    return list[safeIdx];
  });

  protected prev(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const len = this.normalizedImages().length;
    if (len > 1) {
      this.index.update((i) => (i - 1 + len) % len);
    }
  }

  protected next(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const len = this.normalizedImages().length;
    if (len > 1) {
      this.index.update((i) => (i + 1) % len);
    }
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_IMAGE_DATA_URI) {
      img.src = FALLBACK_IMAGE_DATA_URI;
    }
  }
}
