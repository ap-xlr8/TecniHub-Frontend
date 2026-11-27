import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagedResult,
  SparePartDetailDto,
  SparePartSummaryDto,
  UpsertSparePartPayload,
} from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class SparePartsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/spare-parts`;

  getAvailable(filters?: {
    search?: string;
    category?: string;
    modality?: string;
    condition?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<SparePartSummaryDto>> {
    let params = new HttpParams()
      .set('page', String(filters?.page ?? 1))
      .set('pageSize', String(filters?.pageSize ?? 30));
    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.category?.trim()) {
      params = params.set('category', filters.category.trim());
    }
    if (filters?.modality?.trim()) {
      params = params.set('modality', filters.modality.trim());
    }
    if (filters?.condition?.trim()) {
      params = params.set('condition', filters.condition.trim());
    }
    if (filters?.minPrice != null && !Number.isNaN(filters.minPrice) && filters.minPrice > 0) {
      params = params.set('minPrice', String(filters.minPrice));
    }
    if (filters?.maxPrice != null && !Number.isNaN(filters.maxPrice) && filters.maxPrice > 0) {
      params = params.set('maxPrice', String(filters.maxPrice));
    }
    return this.http.get<PagedResult<SparePartSummaryDto>>(this.apiBase, { params });
  }

  getMine(options?: {
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<SparePartSummaryDto>> {
    const params = new HttpParams()
      .set('page', String(options?.page ?? 1))
      .set('pageSize', String(options?.pageSize ?? 30));
    return this.http.get<PagedResult<SparePartSummaryDto>>(`${this.apiBase}/mine`, { params });
  }

  getDetail(id: string): Observable<SparePartDetailDto> {
    return this.http.get<SparePartDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}`);
  }

  create(payload: UpsertSparePartPayload): Observable<SparePartDetailDto> {
    return this.http.post<SparePartDetailDto>(this.apiBase, payload);
  }

  update(id: string, payload: UpsertSparePartPayload): Observable<SparePartDetailDto> {
    return this.http.put<SparePartDetailDto>(`${this.apiBase}/${encodeURIComponent(id)}`, payload);
  }

  setAvailability(id: string, isAvailable: boolean): Observable<SparePartDetailDto> {
    return this.http.patch<SparePartDetailDto>(
      `${this.apiBase}/${encodeURIComponent(id)}/availability`,
      { isAvailable },
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${encodeURIComponent(id)}`);
  }
}
