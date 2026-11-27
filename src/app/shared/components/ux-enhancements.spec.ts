import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbService } from '../../core/ui/breadcrumb.service';
import { LoadingStateService } from '../../core/ui/loading-state.service';
import { RegisterRoleComponent } from '../../features/auth/register-role/register-role.component';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { ImageCarouselComponent } from './image-carousel.component';
import { PaginationComponent } from './pagination.component';
import { ScheduleAgendaPickerComponent } from './schedule-agenda-picker.component';
import { UserAvatarComponent } from './user-avatar.component';

describe('UX Enhancements Components', () => {
  it('renders initials fallback in UserAvatarComponent when avatarUrl is absent', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('name', 'Clara Campos');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('CC');
  });

  it('renders clean empty placeholder in ImageCarouselComponent and cycles through multiple images', () => {
    const fixture = TestBed.createComponent(ImageCarouselComponent);
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Sin fotografías de referencia',
    );

    fixture.componentRef.setInput('images', [
      'https://i.ibb.co/1/one.jpg',
      'https://i.ibb.co/2/two.jpg',
    ]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 / 2');

    const nextBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.carousel-nav--next',
    );
    nextBtn?.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 / 2');
  });

  it('renders clean clickable role cards without redundant button labels', () => {
    TestBed.configureTestingModule({
      imports: [RegisterRoleComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(RegisterRoleComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Soy Cliente');
    expect(text).toContain('Soy Técnico');
    expect(text).not.toContain('Registrarme como cliente');
    expect(text).not.toContain('Registrarme como técnico');
  });

  it('formats 24-hour dates and emits ISO local datetime in ScheduleAgendaPickerComponent', () => {
    const fixture = TestBed.createComponent(ScheduleAgendaPickerComponent);
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    fixture.componentRef.setInput('value', '2026-12-10T16:30');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('10/12/2026 · 16:30 hrs');

    const slot19 = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.agenda-slot-chip',
      ),
    ).find((b) => b.textContent?.includes('19:00 hrs'));
    slot19?.click();
    fixture.detectChanges();

    expect(emitted.at(-1)).toBe('2026-12-10T19:00');
  });

  it('tracks active HTTP requests in LoadingStateService', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const svc = TestBed.inject(LoadingStateService);
    expect(svc.isLoading()).toBe(false);
    svc.beginHttpRequest();
    expect(svc.isLoading()).toBe(true);
    svc.endHttpRequest();
    expect(svc.isLoading()).toBe(false);
  });

  it('renders PaginationComponent summary, controls and emits selected page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('pageSize', 12);
    fixture.componentRef.setInput('totalCount', 28);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mostrando 1–12 de 28');
    const page2Btn = el.querySelector<HTMLButtonElement>('button[aria-label="Página 2"]');
    page2Btn?.click();
    expect(emitted).toEqual([2]);
  });

  it('renders BreadcrumbsComponent trail with current page indicator', () => {
    TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [provideRouter([])],
    });
    const svc = TestBed.inject(BreadcrumbService);
    const fixture = TestBed.createComponent(BreadcrumbsComponent);
    fixture.detectChanges();

    expect(svc.items().length).toBeGreaterThan(0);
    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      'nav[aria-label="Ruta de navegación"]',
    );
    expect(nav).not.toBeNull();
    expect(nav?.querySelector('[aria-current="page"]')).not.toBeNull();
  });
});
