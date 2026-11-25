import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserSummaryDto } from '../auth/auth.models';
import { AuthService } from '../auth/auth.service';
import { UpdateOwnProfilePayload } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiBase = `${environment.apiUrl}/profile`;

  getOwnProfile(): Observable<UserSummaryDto> {
    return this.http
      .get<UserSummaryDto>(`${this.apiBase}/me`)
      .pipe(tap((user) => this.auth.updateCurrentUser(user)));
  }

  updateOwnProfile(payload: UpdateOwnProfilePayload): Observable<UserSummaryDto> {
    return this.http
      .put<UserSummaryDto>(`${this.apiBase}/me`, payload)
      .pipe(tap((user) => this.auth.updateCurrentUser(user)));
  }
}
