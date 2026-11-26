import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RepairCreateComponent } from './repair-create.component';

describe('RepairCreateComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairCreateComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('autocompletes state, municipality and neighborhoods when CP exists in SEPOMEX', () => {
    const fixture = TestBed.createComponent(RepairCreateComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      form: {
        controls: {
          postalCode: { setValue(v: string): void };
          state: { value: string };
          municipality: { value: string };
        };
      };
      lookupPostalCode(): void;
      neighborhoodOptions(): string[];
    };

    component.form.controls.postalCode.setValue('42800');
    component.lookupPostalCode();

    const req = httpMock.expectOne('/api/postal-codes/42800');
    expect(req.request.method).toBe('GET');
    req.flush({
      postalCode: '42800',
      found: true,
      state: 'Hidalgo',
      municipality: 'Tula de Allende',
      city: 'Tula de Allende',
      neighborhoods: ['Centro', 'El Salitre'],
    });

    expect(component.form.controls.state.value).toBe('Hidalgo');
    expect(component.form.controls.municipality.value).toBe('Tula de Allende');
    expect(component.neighborhoodOptions()).toEqual(['Centro', 'El Salitre']);
  });

  it('switches to manual neighborhood input when CP is not found', () => {
    const fixture = TestBed.createComponent(RepairCreateComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      form: { controls: { postalCode: { setValue(v: string): void } } };
      lookupPostalCode(): void;
      manualNeighborhood(): boolean;
    };

    component.form.controls.postalCode.setValue('99999');
    component.lookupPostalCode();

    const req = httpMock.expectOne('/api/postal-codes/99999');
    req.flush({
      postalCode: '99999',
      found: false,
      state: null,
      municipality: null,
      city: null,
      neighborhoods: [],
    });

    expect(component.manualNeighborhood()).toBe(true);
  });
});
