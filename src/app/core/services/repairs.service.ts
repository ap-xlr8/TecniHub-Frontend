import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClientRepairSummaryDto,
  CreateRepairRequestPayload,
  ItineraryItemDto,
  OpenRepairBoardItemDto,
  PagedResult,
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

  getMine(options?: {
    scope?: 'active' | 'history';
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ClientRepairSummaryDto>> {
    let params = new HttpParams()
      .set('page', String(options?.page ?? 1))
      .set('pageSize', String(options?.pageSize ?? 12));
    if (options?.scope) {
      params = params.set('scope', options.scope);
    }
    return this.http.get<PagedResult<ClientRepairSummaryDto>>(`${this.apiBase}/mine`, { params });
  }

  getOpenBoard(filters?: {
    search?: string;
    state?: string;
    municipality?: string;
    postalCode?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<OpenRepairBoardItemDto>> {
    let params = new HttpParams()
      .set('page', String(filters?.page ?? 1))
      .set('pageSize', String(filters?.pageSize ?? 30));
    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.state?.trim()) {
      params = params.set('state', filters.state.trim());
    }
    if (filters?.municipality?.trim()) {
      params = params.set('municipality', filters.municipality.trim());
    }
    if (filters?.postalCode?.trim()) {
      params = params.set('postalCode', filters.postalCode.trim());
    }
    return this.http.get<PagedResult<OpenRepairBoardItemDto>>(`${this.apiBase}/board`, { params });
  }

  getItinerary(options?: {
    scope?: 'active' | 'completed';
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ItineraryItemDto>> {
    let params = new HttpParams()
      .set('page', String(options?.page ?? 1))
      .set('pageSize', String(options?.pageSize ?? 12));
    if (options?.scope) {
      params = params.set('scope', options.scope);
    }
    return this.http.get<PagedResult<ItineraryItemDto>>(`${this.apiBase}/itinerary`, { params });
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

  markOnTheWay(id: string, estimatedArrivalMinutes: number | null): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/on-the-way`, {
      estimatedArrivalMinutes,
    });
  }

  markArrived(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/arrived`, {});
  }

  startWork(id: string, arrivalPinCode?: string | null): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/start`, {
      arrivalPinCode: arrivalPinCode?.trim() || null,
    });
  }

  requestClosure(id: string, closureNotes: string | null): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/request-closure`,
      { closureNotes },
    );
  }

  rejectClosure(id: string, reason: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/reject-closure`,
      { reason },
    );
  }

  confirmClosure(id: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/confirm-closure`,
      {},
    );
  }

  releaseAssignment(id: string, reason: string): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/release`, {
      reason,
    });
  }

  cancel(id: string, reason?: string | null): Observable<RepairDetailDto> {
    return this.http.post<RepairDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}/cancel`, {
      reason: reason?.trim() || null,
    });
  }
}
