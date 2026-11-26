import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('renders TECNIHUB hero and navigation links for unauthenticated users', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent?.toLowerCase()).toContain('reparaciones');
    expect(compiled.querySelector('a[href="/iniciar-sesion"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/registro/cliente"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/registro/tecnico"]')).toBeTruthy();
    expect(compiled.querySelector('img[src="images/home-hero-technician.jpg"]')).toBeTruthy();
  });
});
