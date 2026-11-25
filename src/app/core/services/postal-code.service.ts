import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostalCodeLookupDto } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class PostalCodeService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/postal-codes`;

  lookup(postalCode: string): Observable<PostalCodeLookupDto> {
    const clean = postalCode.trim();
    return this.http.get<PostalCodeLookupDto>(`${this.apiBase}/${encodeURIComponent(clean)}`);
  }
}
