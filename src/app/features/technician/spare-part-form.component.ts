import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SparePartConditionCode, SparePartModalityCode } from '../../core/models/operations.models';
import { SparePartsService } from '../../core/services/spare-parts.service';
import { ImageUploaderCropperComponent } from '../../shared/components/image-uploader-cropper.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-spare-part-form',
  imports: [AppShellComponent, ReactiveFormsModule, RouterLink, ImageUploaderCropperComponent],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="spare-form-heading">
        <div class="page-header-row" style="margin-bottom: 1rem">
          <div>
            <h1 id="spare-form-heading" class="page-title">
              {{ editingId() ? 'Editar refacción' : 'Publicar refacción' }}
            </h1>
            <p class="page-lead" style="margin: 0">
              Define el precio obligatorio en MXN y el medio de contacto. TECNIHUB no procesa pagos
              ni envíos.
            </p>
          </div>
          <a routerLink="/tecnico/refacciones" class="btn btn-secondary">Cancelar</a>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
            {{ errorMessage() }}
          </div>
        }

        <form class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="sp-title">Nombre o título de la refacción *</label>
              <input
                id="sp-title"
                type="text"
                class="input-control"
                placeholder="Ej. Bomba de desagüe universal"
                formControlName="title"
                [attr.aria-invalid]="isFieldInvalid('title')"
                required
              />
              @if (isFieldInvalid('title')) {
                <p class="error-msg">El título es obligatorio (máx. 120 caracteres).</p>
              }
            </div>

            <div class="field">
              <label for="sp-category">Tipo de aparato / categoría *</label>
              <select
                id="sp-category"
                class="input-control"
                formControlName="applianceCategory"
                [attr.aria-invalid]="isFieldInvalid('applianceCategory')"
                required
              >
                <option value="Refrigeración">Refrigeración</option>
                <option value="Lavado y secado">Lavado y secado</option>
                <option value="Cocción y estufas">Cocción y estufas</option>
                <option value="Microondas">Microondas</option>
                <option value="Aire acondicionado">Aire acondicionado</option>
                <option value="Electrónica y tarjetas">Electrónica y tarjetas</option>
                <option value="Otros electrodomésticos">Otros electrodomésticos</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label for="sp-desc">Descripción detallada *</label>
            <textarea
              id="sp-desc"
              rows="4"
              class="input-control"
              placeholder="Detalla el estado físico, pruebas realizadas y qué incluye la pieza..."
              formControlName="description"
              [attr.aria-invalid]="isFieldInvalid('description')"
              required
            ></textarea>
            @if (isFieldInvalid('description')) {
              <p class="error-msg">Describe la pieza con al menos 10 caracteres (máx. 1000).</p>
            }
          </div>

          <div class="field">
            <label for="sp-compat">Compatibilidad (opcional)</label>
            <input
              id="sp-compat"
              type="text"
              class="input-control"
              placeholder="Ej. Compatible con Mabe, Easy y GE modelos 2018-2024"
              formControlName="compatibility"
            />
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="sp-condition">Condición *</label>
              <select id="sp-condition" class="input-control" formControlName="condition" required>
                <option value="New">Nueva</option>
                <option value="Used">Usada</option>
                <option value="Refurbished">Reacondicionada</option>
              </select>
            </div>

            <div class="field">
              <label for="sp-modality">Modalidad *</label>
              <select id="sp-modality" class="input-control" formControlName="modality" required>
                <option value="Sale">Venta</option>
                <option value="Exchange">Intercambio</option>
                <option value="SaleOrExchange">Venta o intercambio</option>
              </select>
            </div>
          </div>

          <div class="field" style="max-inline-size: 18rem">
            <label for="sp-price">Precio en MXN (obligatorio) *</label>
            <input
              id="sp-price"
              type="number"
              min="1"
              step="0.01"
              inputmode="decimal"
              class="input-control"
              placeholder="Ej. 450.00"
              formControlName="priceMxn"
              [attr.aria-invalid]="isFieldInvalid('priceMxn')"
              required
            />
            <p class="field-hint">
              Definido por el vendedor. TECNIHUB no cobra ni intermedia pagos.
            </p>
            @if (isFieldInvalid('priceMxn')) {
              <p class="error-msg">Ingresa un precio válido mayor a $0 MXN.</p>
            }
          </div>

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.25rem 0" />

          <fieldset style="border: 0; padding: 0; margin: 0" class="form-stack">
            <legend style="font-weight: 700; font-size: 1rem; margin-bottom: 0.35rem">
              Medio de contacto externo (indica al menos uno)
            </legend>
            <div class="form-grid">
              <div class="field">
                <label for="sp-phone">Teléfono de contacto</label>
                <input
                  id="sp-phone"
                  type="tel"
                  autocomplete="tel"
                  class="input-control"
                  formControlName="contactPhone"
                />
              </div>
              <div class="field">
                <label for="sp-email">Correo de contacto</label>
                <input
                  id="sp-email"
                  type="email"
                  autocomplete="email"
                  class="input-control"
                  formControlName="contactEmail"
                />
              </div>
            </div>

            <div class="field">
              <label for="sp-contact-notes">Notas de entrega o contacto (opcional)</label>
              <input
                id="sp-contact-notes"
                type="text"
                class="input-control"
                placeholder="Ej. Entregas personales en zona centro o mensajes por la tarde"
                formControlName="contactNotes"
              />
            </div>
          </fieldset>

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.25rem 0" />

          <app-image-uploader-cropper
            inputId="spare-part-photos"
            label="Fotografías de la refacción"
            [minImages]="1"
            [maxImages]="6"
            [imageUrls]="imageUrls()"
            (imageUrlsChange)="imageUrls.set($event)"
          />

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <a routerLink="/tecnico/refacciones" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{
                submitting()
                  ? 'Guardando...'
                  : editingId()
                    ? 'Guardar cambios de refacción'
                    : 'Publicar refacción'
              }}
            </button>
          </div>
        </form>
      </section>
    </app-shell>
  `,
})
export class SparePartFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spareParts = inject(SparePartsService);
  private readonly auth = inject(AuthService);

  protected readonly editingId = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly imageUrls = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    applianceCategory: ['Lavado y secado', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    compatibility: ['', [Validators.maxLength(200)]],
    condition: ['Used' as SparePartConditionCode, [Validators.required]],
    modality: ['Sale' as SparePartModalityCode, [Validators.required]],
    priceMxn: [0, [Validators.required, Validators.min(0.01), Validators.max(9999999.99)]],
    contactPhone: ['', [Validators.maxLength(20)]],
    contactEmail: ['', [Validators.email, Validators.maxLength(254)]],
    contactNotes: ['', [Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.spareParts.getDetail(id).subscribe({
        next: (part) => {
          this.form.patchValue({
            title: part.title,
            applianceCategory: part.applianceCategory,
            description: part.description,
            compatibility: part.compatibility ?? '',
            condition: part.condition,
            modality: part.modality,
            priceMxn: part.priceMxn,
            contactPhone: part.contactPhone ?? '',
            contactEmail: part.contactEmail ?? '',
            contactNotes: part.contactNotes ?? '',
          });
          this.imageUrls.set(part.images.map((i) => i.imageUrl));
        },
        error: (err: unknown) => {
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
    } else {
      const currentUser = this.auth.user();
      this.form.patchValue({
        contactPhone: currentUser?.phone ?? '',
        contactEmail: currentUser?.email ?? '',
      });
    }
  }

  protected isFieldInvalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    const raw = this.form.getRawValue();
    if (!raw.contactPhone.trim() && !raw.contactEmail.trim()) {
      this.errorMessage.set('Proporciona al menos un teléfono o correo de contacto.');
      return;
    }

    if (this.form.invalid) {
      this.errorMessage.set('Revisa los campos obligatorios antes de publicar.');
      return;
    }

    if (this.imageUrls().length < 1 || this.imageUrls().length > 6) {
      this.errorMessage.set(
        'Adjunta al menos 1 fotografía de la refacción (máximo 6) antes de publicar.',
      );
      return;
    }

    const payload = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      applianceCategory: raw.applianceCategory.trim(),
      compatibility: raw.compatibility.trim() || null,
      condition: raw.condition,
      modality: raw.modality,
      priceMxn: Number(raw.priceMxn),
      contactPhone: raw.contactPhone.trim() || null,
      contactEmail: raw.contactEmail.trim() || null,
      contactNotes: raw.contactNotes.trim() || null,
      imageUrls: this.imageUrls(),
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    const id = this.editingId();
    const obs$ = id ? this.spareParts.update(id, payload) : this.spareParts.create(payload);

    obs$.subscribe({
      next: (saved) => {
        this.submitting.set(false);
        void this.router.navigate(['/tecnico/refacciones', saved.id]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }
}
