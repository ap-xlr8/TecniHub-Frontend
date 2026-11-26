import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { ImageItemDto } from '../../core/models/operations.models';
import { FALLBACK_IMAGE_DATA_URI } from './image-uploader-cropper.component';

@Component({
  selector: 'app-image-gallery',
  template: `
    @if (images().length > 0) {
      <div class="image-grid" role="list" aria-label="Galería de fotografías">
        @for (img of images(); track img.id) {
          <button
            type="button"
            class="image-slot"
            style="cursor: pointer; text-align: left"
            (click)="openPreview(img.imageUrl)"
          >
            <img
              [src]="img.imageUrl"
              [alt]="'Fotografía ' + ($index + 1)"
              loading="lazy"
              (error)="onImgError($event)"
            />
            <span class="field-hint" style="text-align: center">Ver ampliada</span>
          </button>
        }
      </div>
    } @else {
      <p class="muted-value" style="margin: 0">Sin fotografías adjuntas.</p>
    }

    <dialog #previewDialog aria-labelledby="gallery-preview-title">
      <h1 id="gallery-preview-title" class="visually-hidden">Vista ampliada de fotografía</h1>
      @if (selectedUrl()) {
        <img
          [src]="selectedUrl()!"
          alt="Vista ampliada"
          style="display: block; inline-size: 100%; max-block-size: 70dvh; object-fit: contain; border-radius: var(--th-radius-sm)"
          (error)="onImgError($event)"
        />
      }
      <div style="display: flex; justify-content: flex-end; margin-top: 1rem">
        <button type="button" class="btn btn-secondary" autofocus (click)="closePreview()">
          Cerrar
        </button>
      </div>
    </dialog>
  `,
})
export class ImageGalleryComponent {
  readonly images = input<ImageItemDto[]>([]);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('previewDialog');
  protected readonly selectedUrl = signal<string | null>(null);

  protected openPreview(url: string): void {
    this.selectedUrl.set(url);
    this.dialogRef()?.nativeElement.showModal();
  }

  protected closePreview(): void {
    this.dialogRef()?.nativeElement.close();
    this.selectedUrl.set(null);
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_IMAGE_DATA_URI) {
      img.src = FALLBACK_IMAGE_DATA_URI;
    }
  }
}
