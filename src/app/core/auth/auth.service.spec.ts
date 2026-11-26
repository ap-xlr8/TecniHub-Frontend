import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('stores session in memory on login and clears it on logout', () => {
    service.login({ email: 'ana@example.com', password: 'Clave#2026' }).subscribe();

    const loginReq = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(loginReq.request.withCredentials).toBe(true);
    loginReq.flush({
      accessToken: 'jwt-token-in-memory',
      accessTokenExpiresAt: '2026-11-25T14:00:00Z',
      user: {
        id: 'u-1',
        firstName: 'Ana',
        lastName: 'Torres',
        email: 'ana@example.com',
        phone: null,
        role: 'Client',
        isEmailVerified: true,
        technicianProfile: null,
      },
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.userRole()).toBe('Client');
    expect(service.getHomeRouteForRole(service.userRole())).toBe('/cliente');

    service.logout().subscribe();
    const logoutReq = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    logoutReq.flush({ message: 'Sesión cerrada correctamente.' });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('maps Technician role to /tecnico home route', () => {
    expect(service.getHomeRouteForRole('Technician')).toBe('/tecnico');
    expect(service.getHomeRouteForRole(null)).toBe('/iniciar-sesion');
  });
});
