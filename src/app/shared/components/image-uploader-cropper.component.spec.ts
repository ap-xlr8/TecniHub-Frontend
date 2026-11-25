import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ImageUploaderCropperComponent } from './image-uploader-cropper.component';

describe('ImageUploaderCropperComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploaderCropperComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('rejects unsupported file mime types before opening cropper', () => {
    const fixture = TestBed.createComponent(ImageUploaderCropperComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onFileSelected(e: Event): void;
      errorMessage(): string | null;
    };

    const badFile = new File(['hello'], 'doc.pdf', { type: 'application/pdf' });
    const fakeInput = { files: [badFile], value: 'doc.pdf' } as unknown as HTMLInputElement;
    comp.onFileSelected({ target: fakeInput } as unknown as Event);

    expect(comp.errorMessage()).toContain('Formato no permitido');
  });

  it('rejects files larger than 5 MB', () => {
    const fixture = TestBed.createComponent(ImageUploaderCropperComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      onFileSelected(e: Event): void;
      errorMessage(): string | null;
    };

    const bigFile = new File([new Uint8Array(5 * 1024 * 1024 + 10)], 'big.jpg', {
      type: 'image/jpeg',
    });
    const fakeInput = { files: [bigFile], value: 'big.jpg' } as unknown as HTMLInputElement;
    comp.onFileSelected({ target: fakeInput } as unknown as Event);

    expect(comp.errorMessage()).toContain('5 MB');
  });
});
