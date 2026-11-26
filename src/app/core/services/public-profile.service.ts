import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateServiceReviewPayload,
  PublicClientProfileDto,
  PublicReviewItemDto,
  PublicTechnicianProfileDto,
} from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class PublicProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl;

  getTechnicianProfile(technicianId: string): Observable<PublicTechnicianProfileDto> {
    return this.http.get<PublicTechnicianProfileDto>(
      `${this.apiBase}/profiles/technicians/${encodeURIComponent(technicianId)}`,
    );
  }

  getClientProfile(clientId: string): Observable<PublicClientProfileDto> {
    return this.http.get<PublicClientProfileDto>(
      `${this.apiBase}/profiles/clients/${encodeURIComponent(clientId)}`,
    );
  }

  getRepairReview(repairId: string): Observable<PublicReviewItemDto | null> {
    return this.http
      .get<PublicReviewItemDto>(`${this.apiBase}/repairs/${encodeURIComponent(repairId)}/review`, {
        observe: 'response',
      })
      .pipe(map((res) => (res.status === 204 ? null : (res.body ?? null))));
  }

  createRepairReview(
    repairId: string,
    payload: CreateServiceReviewPayload,
  ): Observable<PublicReviewItemDto> {
    return this.http.post<PublicReviewItemDto>(
      `${this.apiBase}/repairs/${encodeURIComponent(repairId)}/review`,
      payload,
    );
  }
}
