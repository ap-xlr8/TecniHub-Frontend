import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClientRepairSummaryDto,
  CreateRepairRequestPayload,
  ItineraryItemDto,
  OpenRepairBoardItemDto,
  RepairDetailDto,
  ScheduleRepairResponse,
} from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class RepairsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/repairs`;

  create(payload: CreateRepairRequestPayload): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(this.apiBase, payload);
  }

  getMine(): Observable<ClientRepairSummaryDto[]> {
    return this.http.get<ClientRepairSummaryDto[]>(`${this.apiBase}/mine`);
  }

  getOpenBoard(search?: string): Observable<OpenRepairBoardItemDto[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<OpenRepairBoardItemDto[]>(`${this.apiBase}/board`, { params });
  }

  getItinerary(): Observable<ItineraryItemDto[]> {
    return this.http.get<ItineraryItemDto[]>(`${this.apiBase}/itinerary`);
  }

  getDetail(id: string): Observable<RepairDetailDto> {
    return this.http.get<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}`);
  }

  updateImages(id: string, imageUrls: string[]): Observable<RepairDetailDto> {
    return this.http.put<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/images`, {
      imageUrls,
    });
  }

  accept(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/accept`, {});
  }

  schedule(id: string, scheduledStartAt: string): Observable<ScheduleRepairResponse> {
    return this.http.put<ScheduleRepairResponse>(
      `${this.apiBase}/${encodeURIComponent(id)}/schedule`,
      { scheduledStartAt },
    );
  }

  startWork(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/start`, {});
  }

  requestClosure(id: string, closureNotes: string | null): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/request-closure`,
      { closureNotes },
    );
  }

  confirmClosure(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/confirm-closure`,
      {},
    );
  }

  cancel(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/cancel`, {});
  }
}
