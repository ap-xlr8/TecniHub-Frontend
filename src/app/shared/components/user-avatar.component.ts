import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  template: `
    <span
      class="user-avatar"
      [class.user-avatar--sm]="size() === 'sm'"
      [class.user-avatar--lg]="size() === 'lg'"
      [attr.aria-label]="name()"
    >
      @if (avatarUrl() && !broken()) {
        <img
          [src]="avatarUrl()!"
          [alt]="'Foto de perfil de ' + name()"
          loading="lazy"
          (error)="broken.set(true)"
        />
      } @else {
        <span aria-hidden="true">{{ initials() }}</span>
      }
    </span>
  `,
})
export class UserAvatarComponent {
  readonly name = input.required<string>();
  readonly avatarUrl = input<string | null | undefined>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly broken = signal(false);

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'TH';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  });
}
