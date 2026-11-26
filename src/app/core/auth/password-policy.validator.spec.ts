import { FormControl } from '@angular/forms';
import { evaluatePassword, passwordPolicyValidator } from './password-policy.validator';

describe('passwordPolicyValidator', () => {
  it('accepts valid passwords between 8 and 16 characters with all required classes', () => {
    const control = new FormControl('Clave#2026');
    expect(passwordPolicyValidator(control)).toBeNull();
  });

  it('rejects passwords shorter than 8 or longer than 16 characters', () => {
    expect(passwordPolicyValidator(new FormControl('Ab1!567'))).not.toBeNull();
    expect(passwordPolicyValidator(new FormControl('Ab1!5678901234567'))).not.toBeNull();
  });

  it('rejects passwords missing uppercase, lowercase, digit, special char, or containing whitespace', () => {
    expect(passwordPolicyValidator(new FormControl('clave#2026'))).not.toBeNull();
    expect(passwordPolicyValidator(new FormControl('CLAVE#2026'))).not.toBeNull();
    expect(passwordPolicyValidator(new FormControl('Clave#abcd'))).not.toBeNull();
    expect(passwordPolicyValidator(new FormControl('Clave20260'))).not.toBeNull();
    expect(passwordPolicyValidator(new FormControl('Clave# 2026'))).not.toBeNull();
  });

  it('evaluates individual checklist flags accurately', () => {
    const check = evaluatePassword('Tecni#26');
    expect(check).toEqual({
      length: true,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      noSpaces: true,
    });
  });
});
