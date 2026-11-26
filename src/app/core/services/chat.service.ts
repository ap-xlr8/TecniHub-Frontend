import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatConversationSummaryDto,
  ChatMessageDto,
  ChatThreadDto,
  UnreadCountDto,
} from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/chat`;

  private readonly unreadCountSignal = signal(0);
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  getConversations(): Observable<ChatConversationSummaryDto[]> {
    return this.http.get<ChatConversationSummaryDto[]>(`${this.apiBase}/conversations`);
  }

  refreshUnreadCount(): Observable<UnreadCountDto> {
    return this.http
      .get<UnreadCountDto>(`${this.apiBase}/unread-count`)
      .pipe(tap((res) => this.unreadCountSignal.set(res.unreadCount)));
  }

  openRepairConversation(repairId: string): Observable<ChatConversationSummaryDto> {
    return this.http.post<ChatConversationSummaryDto>(
      `${this.apiBase}/conversations/repair/${encodeURIComponent(repairId)}`,
      {},
    );
  }

  openSparePartConversation(sparePartId: string): Observable<ChatConversationSummaryDto> {
    return this.http.post<ChatConversationSummaryDto>(
      `${this.apiBase}/conversations/spare-part/${encodeURIComponent(sparePartId)}`,
      {},
    );
  }

  getMessages(conversationId: string, afterUtc?: string): Observable<ChatThreadDto> {
    let params = new HttpParams();
    if (afterUtc) {
      params = params.set('after', afterUtc);
    }
    return this.http.get<ChatThreadDto>(
      `${this.apiBase}/conversations/${encodeURIComponent(conversationId)}/messages`,
      { params },
    );
  }

  sendMessage(conversationId: string, body: string): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(
      `${this.apiBase}/conversations/${encodeURIComponent(conversationId)}/messages`,
      { body },
    );
  }
}
