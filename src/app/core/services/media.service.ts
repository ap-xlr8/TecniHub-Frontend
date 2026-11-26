import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadedImageDto } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/media`;

  uploadImage(file: Blob, fileName = 'imagen.jpg'): Observable<UploadedImageDto> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    return this.http.post<UploadedImageDto>(`${this.apiBase}/images`, formData);
  }
}
