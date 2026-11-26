import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from '../../features/errors/not-found.component';
import { ServerErrorComponent } from '../../features/errors/server-error.component';
import { errorInterceptor } from './error.interceptor';
import { GlobalErrorService } from './global-error.service';

describe('Global error handling (404, 500, offline)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let globalErrors: GlobalErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, ServerErrorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    globalErrors = TestBed.inject(GlobalErrorService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('reports network error on status 0 and clears after a successful request', () => {
    http.get('/api/repairs/mine').subscribe({ error: () => undefined });
    const failed = httpMock.expectOne('/api/repairs/mine');
    failed.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(globalErrors.error()?.code).toBe('offline');
    expect(globalErrors.error()?.status).toBe(0);

    http.get('/api/repairs/mine').subscribe();
    httpMock.expectOne('/api/repairs/mine').flush([]);
    expect(globalErrors.error()).toBeNull();
  });

  it('reports server error on 500 but leaves 400 validation errors local to the form', () => {
    http.post('/api/repairs', {}).subscribe({ error: () => undefined });
    httpMock
      .expectOne('/api/repairs')
      .flush({ detail: 'Validación' }, { status: 400, statusText: 'Bad Request' });
    expect(globalErrors.error()).toBeNull();

    http.get('/api/repairs/board').subscribe({ error: () => undefined });
    httpMock
      .expectOne('/api/repairs/board')
      .flush({ detail: 'Error interno' }, { status: 500, statusText: 'Server Error' });
    expect(globalErrors.error()?.code).toBe('server');
    expect(globalErrors.error()?.status).toBe(500);
  });

  it('renders dedicated 404 NotFoundComponent and 500 ServerErrorComponent', () => {
    const nfFixture = TestBed.createComponent(NotFoundComponent);
    nfFixture.detectChanges();
    expect(nfFixture.nativeElement.textContent).toContain('404');
    expect(nfFixture.nativeElement.textContent).toContain('Página no encontrada');

    const seFixture = TestBed.createComponent(ServerErrorComponent);
    seFixture.detectChanges();
    expect(seFixture.nativeElement.textContent).toContain('500');
  });
});
