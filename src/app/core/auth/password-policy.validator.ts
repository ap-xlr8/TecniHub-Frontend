import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,16}$';

export interface PasswordChecklist {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
}

export function evaluatePassword(value: string): PasswordChecklist {
  return {
    length: value.length >= 8 && value.length <= 16,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
    noSpaces: value.length > 0 && !/\s/.test(value),
  };
}

export function passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }

  const check = evaluatePassword(value);
  const allMet =
    check.length &&
    check.uppercase &&
    check.lowercase &&
    check.number &&
    check.special &&
    check.noSpaces;

  return allMet ? null : { passwordPolicy: check };
}
