import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PostalCodeService } from '../../core/services/postal-code.service';
import { RepairsService } from '../../core/services/repairs.service';
import { ImageUploaderCropperComponent } from '../../shared/components/image-uploader-cropper.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-repair-create',
  imports: [AppShellComponent, ReactiveFormsModule, RouterLink, ImageUploaderCropperComponent],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="new-repair-heading">
        <div class="page-header-row" style="margin-bottom: 1rem">
          <div>
            <h1 id="new-repair-heading" class="page-title">Publicar solicitud de reparación</h1>
            <p class="page-lead" style="margin: 0">
              Describe el electrodoméstico, la falla y tu domicilio. Antes de que un técnico sea
              asignado, otros usuarios solo verán tu ubicación hasta colonia.
            </p>
          </div>
          <a routerLink="/cliente" class="btn btn-secondary">Cancelar</a>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
            {{ errorMessage() }}
          </div>
        }

        <form class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <fieldset style="border: 0; padding: 0; margin: 0" class="form-stack">
            <legend style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem">
              1. Electrodoméstico y falla
            </legend>

            <div class="form-grid">
              <div class="field">
                <label for="appliance-name">Electrodoméstico *</label>
                <input
                  id="appliance-name"
                  type="text"
                  class="input-control"
                  list="appliance-suggestions"
                  placeholder="Ej. Refrigerador, Lavadora, Estufa"
                  formControlName="applianceName"
                  [attr.aria-invalid]="isFieldInvalid('applianceName')"
                  required
                />
                <datalist id="appliance-suggestions">
                  <option value="Refrigerador"></option>
                  <option value="Lavadora"></option>
                  <option value="Secadora"></option>
                  <option value="Estufa"></option>
                  <option value="Horno de microondas"></option>
                  <option value="Aire acondicionado"></option>
                  <option value="Lavavajillas"></option>
                </datalist>
                @if (isFieldInvalid('applianceName')) {
                  <p class="error-msg">Indica el electrodoméstico (máximo 120 caracteres).</p>
                }
              </div>

              <div class="field">
                <label for="brand-model">Marca y modelo (opcional)</label>
                <input
                  id="brand-model"
                  type="text"
                  class="input-control"
                  placeholder="Ej. LG TurboDrum 18 kg"
                  formControlName="brandModel"
                />
              </div>
            </div>

            <div class="field">
              <label for="issue-desc">Descripción de la falla *</label>
              <textarea
                id="issue-desc"
                rows="4"
                class="input-control"
                placeholder="Explica qué ocurre, desde cuándo y si muestra algún código de error..."
                formControlName="issueDescription"
                [attr.aria-invalid]="isFieldInvalid('issueDescription')"
                required
              ></textarea>
              @if (isFieldInvalid('issueDescription')) {
                <p class="error-msg">Describe la falla con al menos 10 caracteres (máx. 1000).</p>
              }
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="preferred-date">Fecha deseada *</label>
                <input
                  id="preferred-date"
                  type="date"
                  class="input-control"
                  [min]="todayIso"
                  formControlName="preferredDate"
                  [attr.aria-invalid]="isFieldInvalid('preferredDate')"
                  required
                />
                @if (isFieldInvalid('preferredDate')) {
                  <p class="error-msg">Selecciona una fecha válida.</p>
                }
              </div>

              <div class="field">
                <label for="preferred-slot">Horario deseado *</label>
                <select
                  id="preferred-slot"
                  class="input-control"
                  formControlName="preferredTimeSlot"
                  [attr.aria-invalid]="isFieldInvalid('preferredTimeSlot')"
                  required
                >
                  <option value="Mañana (09:00 - 13:00)">Mañana (09:00 - 13:00)</option>
                  <option value="Tarde (13:00 - 18:00)">Tarde (13:00 - 18:00)</option>
                  <option value="Noche (18:00 - 21:00)">Noche (18:00 - 21:00)</option>
                  <option value="Horario flexible">Horario flexible</option>
                </select>
              </div>
            </div>
          </fieldset>

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.25rem 0" />

          <fieldset style="border: 0; padding: 0; margin: 0" class="form-stack">
            <legend style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem">
              2. Domicilio de atención (privado hasta confirmar asignación)
            </legend>

            <div class="alert alert-info" style="font-size: 0.88rem">
              Privacidad protegida: en el tablón de servicios los técnicos solo verán hasta tu
              <strong>colonia</strong>. La calle y números se mostrarán únicamente al técnico
              asignado después de aceptar el servicio.
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="postal-code">Código postal (5 dígitos) *</label>
                <div style="display: flex; gap: 0.5rem">
                  <input
                    id="postal-code"
                    type="text"
                    class="input-control"
                    autocomplete="postal-code"
                    inputmode="numeric"
                    maxlength="5"
                    placeholder="Ej. 42800"
                    formControlName="postalCode"
                    [attr.aria-invalid]="isFieldInvalid('postalCode')"
                    (input)="onPostalCodeInput()"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-secondary"
                    [disabled]="lookingUpCp()"
                    (click)="lookupPostalCode()"
                  >
                    {{ lookingUpCp() ? 'Buscando...' : 'Buscar CP' }}
                  </button>
                </div>
                @if (cpMessage()) {
                  <p class="field-hint">{{ cpMessage() }}</p>
                }
                @if (isFieldInvalid('postalCode')) {
                  <p class="error-msg">Ingresa un código postal de 5 dígitos.</p>
                }
              </div>

              <div class="field">
                <label for="addr-state">Estado *</label>
                <input
                  id="addr-state"
                  type="text"
                  class="input-control"
                  autocomplete="address-level1"
                  formControlName="state"
                  [attr.aria-invalid]="isFieldInvalid('state')"
                  required
                />
                @if (isFieldInvalid('state')) {
                  <p class="error-msg">El estado es obligatorio.</p>
                }
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="addr-municipality">Municipio o alcaldía *</label>
                <input
                  id="addr-municipality"
                  type="text"
                  class="input-control"
                  autocomplete="address-level2"
                  formControlName="municipality"
                  [attr.aria-invalid]="isFieldInvalid('municipality')"
                  required
                />
                @if (isFieldInvalid('municipality')) {
                  <p class="error-msg">El municipio o alcaldía es obligatorio.</p>
                }
              </div>

              <div class="field">
                <label for="addr-neighborhood">Colonia *</label>
                @if (neighborhoodOptions().length > 0 && !manualNeighborhood()) {
                  <select
                    id="addr-neighborhood"
                    class="input-control"
                    formControlName="neighborhood"
                    [attr.aria-invalid]="isFieldInvalid('neighborhood')"
                    required
                  >
                    <option value="">Selecciona tu colonia</option>
                    @for (col of neighborhoodOptions(); track col) {
                      <option [value]="col">{{ col }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    style="justify-self: start"
                    (click)="manualNeighborhood.set(true)"
                  >
                    Mi colonia no aparece, escribir manualmente
                  </button>
                } @else {
                  <input
                    id="addr-neighborhood"
                    type="text"
                    class="input-control"
                    autocomplete="address-level3"
                    placeholder="Escribe el nombre de tu colonia"
                    formControlName="neighborhood"
                    [attr.aria-invalid]="isFieldInvalid('neighborhood')"
                    required
                  />
                }
                @if (isFieldInvalid('neighborhood')) {
                  <p class="error-msg">Confirma o escribe tu colonia.</p>
                }
              </div>
            </div>

            <div class="field">
              <label for="addr-street">Calle *</label>
              <input
                id="addr-street"
                type="text"
                class="input-control"
                autocomplete="address-line1"
                placeholder="Ej. Av. Hidalgo"
                formControlName="street"
                [attr.aria-invalid]="isFieldInvalid('street')"
                required
              />
              @if (isFieldInvalid('street')) {
                <p class="error-msg">La calle es obligatoria.</p>
              }
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="addr-ext">Número exterior (opcional)</label>
                <input
                  id="addr-ext"
                  type="text"
                  class="input-control"
                  autocomplete="address-line2"
                  placeholder="Ej. 45 o S/N"
                  formControlName="exteriorNumber"
                />
              </div>

              <div class="field">
                <label for="addr-int">Número interior (opcional)</label>
                <input
                  id="addr-int"
                  type="text"
                  class="input-control"
                  placeholder="Ej. Depto 2B"
                  formControlName="interiorNumber"
                />
              </div>
            </div>

            <div class="field">
              <label for="addr-ref">Referencias adicionales (opcional)</label>
              <input
                id="addr-ref"
                type="text"
                class="input-control"
                placeholder="Ej. Casa color arena, frente a la farmacia"
                formControlName="addressReference"
              />
            </div>
          </fieldset>

          <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.25rem 0" />

          <app-image-uploader-cropper
            inputId="repair-photos"
            label="3. Fotografías del equipo o falla"
            [imageUrls]="imageUrls()"
            (imageUrlsChange)="imageUrls.set($event)"
          />

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <a routerLink="/cliente" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Publicando...' : 'Publicar solicitud de reparación' }}
            </button>
          </div>
        </form>
      </section>
    </app-shell>
  `,
})
export class RepairCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly postalCodes = inject(PostalCodeService);
  private readonly repairs = inject(RepairsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly todayIso = new Date().toISOString().slice(0, 10);
  protected readonly submitting = signal(false);
  protected readonly lookingUpCp = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly cpMessage = signal<string | null>(null);
  protected readonly neighborhoodOptions = signal<string[]>([]);
  protected readonly manualNeighborhood = signal(false);
  protected readonly imageUrls = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    applianceName: ['', [Validators.required, Validators.maxLength(120)]],
    brandModel: ['', [Validators.maxLength(120)]],
    issueDescription: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(1000)],
    ],
    preferredDate: [this.todayIso, [Validators.required]],
    preferredTimeSlot: ['Mañana (09:00 - 13:00)', [Validators.required, Validators.maxLength(80)]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    state: ['', [Validators.required, Validators.maxLength(80)]],
    municipality: ['', [Validators.required, Validators.maxLength(100)]],
    city: ['', [Validators.maxLength(100)]],
    neighborhood: ['', [Validators.required, Validators.maxLength(120)]],
    street: ['', [Validators.required, Validators.maxLength(150)]],
    exteriorNumber: ['', [Validators.maxLength(30)]],
    interiorNumber: ['', [Validators.maxLength(30)]],
    addressReference: ['', [Validators.maxLength(250)]],
  });

  protected isFieldInvalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected onPostalCodeInput(): void {
    const cp = this.form.controls.postalCode.value.trim();
    if (/^\d{5}$/.test(cp)) {
      this.lookupPostalCode();
    }
  }

  protected lookupPostalCode(): void {
    const cp = this.form.controls.postalCode.value.trim();
    if (!/^\d{5}$/.test(cp)) {
      this.cpMessage.set('Escribe exactamente 5 dígitos para buscar en SEPOMEX.');
      return;
    }

    this.lookingUpCp.set(true);
    this.cpMessage.set('Consultando catálogo SEPOMEX...');
    this.postalCodes.lookup(cp).subscribe({
      next: (res) => {
        this.lookingUpCp.set(false);
        if (res.found) {
          this.neighborhoodOptions.set(res.neighborhoods);
          this.manualNeighborhood.set(false);
          this.form.patchValue({
            state: res.state ?? '',
            municipality: res.municipality ?? '',
            city: res.city ?? '',
            neighborhood: res.neighborhoods.length === 1 ? res.neighborhoods[0] : '',
          });
          this.cpMessage.set(
            `CP encontrado (${res.neighborhoods.length} colonia(s) disponibles). Confirma tu colonia.`,
          );
        } else {
          this.neighborhoodOptions.set([]);
          this.manualNeighborhood.set(true);
          this.cpMessage.set(
            'El código postal no apareció en el catálogo; puedes completar los datos manualmente.',
          );
        }
      },
      error: () => {
        this.lookingUpCp.set(false);
        this.neighborhoodOptions.set([]);
        this.manualNeighborhood.set(true);
        this.cpMessage.set(
          'No fue posible consultar el catálogo; completa la ubicación manualmente.',
        );
      },
    });
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Completa todos los campos obligatorios antes de publicar.');
      return;
    }

    const raw = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.repairs
      .create({
        applianceName: raw.applianceName.trim(),
        brandModel: raw.brandModel.trim() || null,
        issueDescription: raw.issueDescription.trim(),
        preferredDate: raw.preferredDate,
        preferredTimeSlot: raw.preferredTimeSlot.trim(),
        postalCode: raw.postalCode.trim(),
        state: raw.state.trim(),
        municipality: raw.municipality.trim(),
        city: raw.city.trim() || null,
        neighborhood: raw.neighborhood.trim(),
        street: raw.street.trim(),
        exteriorNumber: raw.exteriorNumber.trim() || null,
        interiorNumber: raw.interiorNumber.trim() || null,
        addressReference: raw.addressReference.trim() || null,
        imageUrls: this.imageUrls(),
      })
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          void this.router.navigate(['/cliente/solicitudes', created.id]);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }
}
