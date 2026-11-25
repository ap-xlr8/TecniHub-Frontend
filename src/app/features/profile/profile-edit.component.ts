import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-profile-edit',
  imports: [AppShellComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="edit-profile-heading">
        <div class="page-header-row" style="margin-bottom: 1rem">
          <div>
            <h1 id="edit-profile-heading" class="page-title">Editar mi perfil</h1>
            <p class="page-lead" style="margin: 0">
              Actualiza tus datos permitidos. Por seguridad, el rol, el correo y la contraseña no se
              modifican desde esta pantalla.
            </p>
          </div>
          <a routerLink="/perfil" class="btn btn-secondary">Volver al perfil</a>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert" style="margin-bottom: 1rem">
            {{ errorMessage() }}
          </div>
        }

        <form class="form-stack" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-grid">
            <div class="field">
              <label for="edit-first-name">Nombre *</label>
              <input
                id="edit-first-name"
                type="text"
                class="input-control"
                autocomplete="given-name"
                formControlName="firstName"
                [attr.aria-invalid]="isFieldInvalid('firstName')"
                required
              />
              @if (isFieldInvalid('firstName')) {
                <p class="error-msg">Ingresa tu nombre (máximo 80 caracteres).</p>
              }
            </div>

            <div class="field">
              <label for="edit-last-name">Apellidos *</label>
              <input
                id="edit-last-name"
                type="text"
                class="input-control"
                autocomplete="family-name"
                formControlName="lastName"
                [attr.aria-invalid]="isFieldInvalid('lastName')"
                required
              />
              @if (isFieldInvalid('lastName')) {
                <p class="error-msg">Ingresa tus apellidos (máximo 100 caracteres).</p>
              }
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="edit-phone">Teléfono (opcional)</label>
              <input
                id="edit-phone"
                type="tel"
                class="input-control"
                autocomplete="tel"
                inputmode="tel"
                placeholder="Ej. 7731234567"
                formControlName="phone"
                [attr.aria-invalid]="isFieldInvalid('phone')"
              />
              @if (isFieldInvalid('phone')) {
                <p class="error-msg">Ingresa un número válido de 7 a 20 caracteres.</p>
              }
            </div>

            <div class="field">
              <label for="readonly-email">Correo electrónico (solo lectura)</label>
              <input
                id="readonly-email"
                type="email"
                class="input-control"
                [value]="auth.user()?.email ?? ''"
                disabled
              />
            </div>
          </div>

          @if (isTechnician()) {
            <hr style="border: 0; border-top: 1px solid var(--th-border); margin: 0.4rem 0" />
            <h2 style="margin: 0; font-size: 1.05rem">Información profesional</h2>

            <div class="field">
              <label for="edit-specialties">Especialidades *</label>
              <input
                id="edit-specialties"
                type="text"
                class="input-control"
                formControlName="specialties"
                [attr.aria-invalid]="isFieldInvalid('specialties')"
                required
              />
              @if (isFieldInvalid('specialties')) {
                <p class="error-msg">Describe tus especialidades (máximo 300 caracteres).</p>
              }
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="edit-experience">Años de experiencia *</label>
                <input
                  id="edit-experience"
                  type="number"
                  min="0"
                  max="60"
                  class="input-control"
                  formControlName="experienceYears"
                  [attr.aria-invalid]="isFieldInvalid('experienceYears')"
                  required
                />
                @if (isFieldInvalid('experienceYears')) {
                  <p class="error-msg">Indica un número entre 0 y 60.</p>
                }
              </div>

              <div class="field">
                <label for="edit-zone">Zona de atención *</label>
                <input
                  id="edit-zone"
                  type="text"
                  class="input-control"
                  formControlName="serviceZone"
                  [attr.aria-invalid]="isFieldInvalid('serviceZone')"
                  required
                />
                @if (isFieldInvalid('serviceZone')) {
                  <p class="error-msg">La zona de atención es obligatoria.</p>
                }
              </div>
            </div>

            <div class="field">
              <label for="edit-business">Nombre comercial (opcional)</label>
              <input
                id="edit-business"
                type="text"
                class="input-control"
                autocomplete="organization"
                formControlName="businessName"
                [attr.aria-invalid]="isFieldInvalid('businessName')"
              />
            </div>
          }

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap">
            <a routerLink="/perfil" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar cambios del perfil' }}
            </button>
          </div>
        </form>
      </section>
    </app-shell>
  `,
})
export class ProfileEditComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isTechnician = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20), Validators.pattern(/^$|^[0-9+\-\s()]{7,20}$/)]],
    specialties: ['', [Validators.maxLength(300)]],
    experienceYears: [0, [Validators.min(0), Validators.max(60)]],
    serviceZone: ['', [Validators.maxLength(150)]],
    businessName: ['', [Validators.maxLength(120)]],
  });

  ngOnInit(): void {
    this.profileService.getOwnProfile().subscribe({
      next: (user) => {
        const tech = user.role === 'Technician';
        this.isTechnician.set(tech);

        if (tech) {
          this.form.controls.specialties.addValidators(Validators.required);
          this.form.controls.serviceZone.addValidators(Validators.required);
          this.form.controls.experienceYears.addValidators(Validators.required);
        }

        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          specialties: user.technicianProfile?.specialties ?? '',
          experienceYears: user.technicianProfile?.experienceYears ?? 0,
          serviceZone: user.technicianProfile?.serviceZone ?? '',
          businessName: user.technicianProfile?.businessName ?? '',
        });
        this.form.updateValueAndValidity();
      },
      error: (err: unknown) => {
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected isFieldInvalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Revisa los campos señalados antes de guardar.');
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set(null);

    this.profileService
      .updateOwnProfile({
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        phone: raw.phone.trim() || null,
        specialties: this.isTechnician() ? raw.specialties.trim() : null,
        experienceYears: this.isTechnician() ? Number(raw.experienceYears) : null,
        serviceZone: this.isTechnician() ? raw.serviceZone.trim() : null,
        businessName: this.isTechnician() ? raw.businessName.trim() || null : null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigate(['/perfil'], { state: { profileUpdated: true } });
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        },
      });
  }
}
