import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { MediaService } from '../../core/services/media.service';

export const FALLBACK_IMAGE_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#edf2f8"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="16">Imagen no disponible</text>' +
      '</svg>',
  );

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-image-uploader-cropper',
  template: `
    <div class="field">
      <div
        style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem"
      >
        <label [for]="inputId()">
          {{ label() }} ({{ imageUrls().length }}/{{ maxImages() }})
        </label>
        <span class="field-hint">Opcional · JPG, PNG o WebP · Máx. 5 MB</span>
      </div>

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (imageUrls().length > 0) {
        <div class="image-grid">
          @for (url of imageUrls(); track url + '-' + $index) {
            <div class="image-slot">
              <img
                [src]="url"
                [alt]="'Imagen adjunta ' + ($index + 1)"
                loading="lazy"
                (error)="onImgError($event)"
              />
              <div class="image-slot-actions">
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  [disabled]="uploading()"
                  (click)="triggerReplace($index)"
                >
                  Reemplazar
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  [disabled]="uploading()"
                  (click)="removeAt($index)"
                >
                  Quitar
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (imageUrls().length < maxImages()) {
        <div>
          <input
            #fileInput
            [id]="inputId()"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="visually-hidden"
            (change)="onFileSelected($event)"
          />
          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="uploading()"
            (click)="triggerAdd()"
          >
            {{ uploading() ? 'Subiendo imagen...' : '+ Agregar y recortar imagen' }}
          </button>
        </div>
      } @else {
        <input
          #fileInput
          [id]="inputId()"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="visually-hidden"
          (change)="onFileSelected($event)"
        />
        <p class="field-hint">
          Alcanzaste el límite de {{ maxImages() }} imágenes. Puedes reemplazar o quitar alguna si
          deseas cambiarlas.
        </p>
      }
    </div>

    <dialog #cropDialog aria-labelledby="crop-dialog-title">
      <h1
        id="crop-dialog-title"
        class="page-title"
        style="font-size: 1.2rem; margin-bottom: 0.4rem"
      >
        Recortar imagen antes de subir
      </h1>
      <p class="field-hint" style="margin-bottom: 0.9rem">
        Ajusta el acercamiento y encuadre (4:3). La imagen se validará en el servidor antes de
        guardarse.
      </p>

      <canvas #cropCanvas width="800" height="600" class="cropper-canvas"></canvas>

      <div class="form-stack" style="margin-top: 1rem">
        <div class="field">
          <label for="crop-zoom">Acercamiento ({{ zoom().toFixed(2) }}x)</label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="3"
            step="0.05"
            [value]="zoom()"
            (input)="onZoomChange($event)"
          />
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="crop-pan-x">Desplazar horizontal</label>
            <input
              id="crop-pan-x"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              [value]="panX()"
              (input)="onPanXChange($event)"
            />
          </div>
          <div class="field">
            <label for="crop-pan-y">Desplazar vertical</label>
            <input
              id="crop-pan-y"
              type="range"
              min="-1"
              max="1"
              step="0.02"
              [value]="panY()"
              (input)="onPanYChange($event)"
            />
          </div>
        </div>
      </div>

      <div
        style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; flex-wrap: wrap"
      >
        <button
          type="button"
          class="btn btn-secondary"
          autofocus
          [disabled]="uploading()"
          (click)="closeCropDialog()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          [disabled]="uploading()"
          (click)="confirmCropAndUpload()"
        >
          {{ uploading() ? 'Subiendo...' : 'Recortar y subir' }}
        </button>
      </div>
    </dialog>
  `,
})
export class ImageUploaderCropperComponent {
  private readonly media = inject(MediaService);
  private readonly auth = inject(AuthService);

  private readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('cropDialog');
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('cropCanvas');

  readonly label = input('Fotografías');
  readonly inputId = input('image-upload-input');
  readonly maxImages = input(5);
  readonly imageUrls = input<string[]>([]);
  readonly imageUrlsChange = output<string[]>();

  protected readonly uploading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly zoom = signal(1);
  protected readonly panX = signal(0);
  protected readonly panY = signal(0);

  private loadedImage: HTMLImageElement | null = null;
  private replaceIndex: number | null = null;

  protected triggerAdd(): void {
    this.replaceIndex = null;
    this.errorMessage.set(null);
    this.fileInputRef()?.nativeElement.click();
  }

  protected triggerReplace(index: number): void {
    this.replaceIndex = index;
    this.errorMessage.set(null);
    this.fileInputRef()?.nativeElement.click();
  }

  protected removeAt(index: number): void {
    const next = this.imageUrls().filter((_, idx) => idx !== index);
    this.imageUrlsChange.emit(next);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (this.replaceIndex === null && this.imageUrls().length >= this.maxImages()) {
      this.errorMessage.set(`Solo se permiten hasta ${this.maxImages()} imágenes.`);
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      this.errorMessage.set('Formato no permitido. Selecciona una imagen JPG, PNG o WebP.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set('La imagen supera el tamaño máximo permitido de 5 MB.');
      return;
    }

    this.errorMessage.set(null);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      this.loadedImage = img;
      this.zoom.set(1);
      this.panX.set(0);
      this.panY.set(0);
      this.dialogRef()?.nativeElement.showModal();
      this.renderCanvas();
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      this.errorMessage.set('No se pudo leer la imagen seleccionada. Intenta con otro archivo.');
    };
    img.src = objectUrl;
  }

  protected onZoomChange(event: Event): void {
    this.zoom.set(Number((event.target as HTMLInputElement).value));
    this.renderCanvas();
  }

  protected onPanXChange(event: Event): void {
    this.panX.set(Number((event.target as HTMLInputElement).value));
    this.renderCanvas();
  }

  protected onPanYChange(event: Event): void {
    this.panY.set(Number((event.target as HTMLInputElement).value));
    this.renderCanvas();
  }

  protected closeCropDialog(): void {
    this.loadedImage = null;
    this.replaceIndex = null;
    this.dialogRef()?.nativeElement.close();
  }

  protected confirmCropAndUpload(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || !this.loadedImage) {
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set(null);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.uploading.set(false);
          this.errorMessage.set('No fue posible procesar el recorte. Intenta de nuevo.');
          return;
        }

        if (blob.size > MAX_SIZE_BYTES) {
          this.uploading.set(false);
          this.errorMessage.set('La imagen recortada supera 5 MB. Intenta con otra imagen.');
          return;
        }

        this.media.uploadImage(blob, 'tecnihub-upload.jpg').subscribe({
          next: (res) => {
            this.uploading.set(false);
            const current = [...this.imageUrls()];
            if (this.replaceIndex !== null && this.replaceIndex < current.length) {
              current[this.replaceIndex] = res.imageUrl;
            } else if (current.length < this.maxImages()) {
              current.push(res.imageUrl);
            }
            this.imageUrlsChange.emit(current);
            this.closeCropDialog();
          },
          error: (err: unknown) => {
            this.uploading.set(false);
            this.errorMessage.set(
              this.auth.extractErrorMessage(
                err,
                'No fue posible subir la imagen. Vuelve a intentarlo.',
              ),
            );
            this.closeCropDialog();
          },
        });
      },
      'image/jpeg',
      0.88,
    );
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_IMAGE_DATA_URI) {
      img.src = FALLBACK_IMAGE_DATA_URI;
    }
  }

  private renderCanvas(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const img = this.loadedImage;
    if (!canvas || !img) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cw, ch);

    const baseScale = Math.max(cw / img.width, ch / img.height);
    const scale = baseScale * this.zoom();
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const maxOffsetX = Math.max(0, (drawWidth - cw) / 2);
    const maxOffsetY = Math.max(0, (drawHeight - ch) / 2);
    const dx = (cw - drawWidth) / 2 + this.panX() * maxOffsetX;
    const dy = (ch - drawHeight) / 2 + this.panY() * maxOffsetY;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  }
}
