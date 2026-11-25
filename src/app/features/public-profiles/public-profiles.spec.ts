import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ClientPublicProfileComponent } from './client-public-profile.component';
import { TechnicianPublicProfileComponent } from './technician-public-profile.component';

describe('Public Profile Components', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianPublicProfileComponent, ClientPublicProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '00000000-0000-0000-0000-000000000123' }),
            },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows no reviews message without inventing an average when technician has zero reviews', () => {
    const fixture = TestBed.createComponent(TechnicianPublicProfileComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne(
      '/api/profiles/technicians/00000000-0000-0000-0000-000000000123',
    );
    req.flush({
      technicianUserId: '00000000-0000-0000-0000-000000000123',
      displayName: 'Diego Nava',
      businessName: null,
      specialties: 'Lavadoras',
      experienceYears: 5,
      serviceZone: 'Tepeji',
      memberSinceUtc: '2026-11-01T00:00:00Z',
      completedServicesCount: 2,
      reviewCount: 0,
      averageRating: null,
      reviews: [],
    });

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aún no existen reseñas');
    expect(text).toContain('No proporcionado');
  });

  it('shows No disponible when optional publicRegion is absent on client public profile', () => {
    const fixture = TestBed.createComponent(ClientPublicProfileComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/profiles/clients/00000000-0000-0000-0000-000000000123');
    req.flush({
      clientUserId: '00000000-0000-0000-0000-000000000123',
      displayName: 'Paula Díaz',
      publicRegion: null,
      memberSinceUtc: '2026-11-01T00:00:00Z',
      completedServicesCount: 3,
    });

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Paula Díaz');
    expect(text).toContain('No disponible');
  });
});
