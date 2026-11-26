import { Injectable, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ChatMessageDto, UserNotificationDto } from '../models/operations.models';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth = inject(AuthService);

  private connection: HubConnection | null = null;
  private readonly connectedSignal = signal(false);
  readonly connected = this.connectedSignal.asReadonly();

  private readonly chatMessageSubject = new Subject<ChatMessageDto>();
  private readonly notificationSubject = new Subject<UserNotificationDto>();

  readonly chatMessage$ = this.chatMessageSubject.asObservable();
  readonly notification$ = this.notificationSubject.asObservable();

  async ensureConnected(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    if (
      this.connection &&
      (this.connection.state === HubConnectionState.Connected ||
        this.connection.state === HubConnectionState.Connecting ||
        this.connection.state === HubConnectionState.Reconnecting)
    ) {
      return;
    }

    const hubUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/hubs/realtime`;

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ChatMessageReceived', (message: ChatMessageDto) => {
      this.chatMessageSubject.next(message);
    });

    this.connection.on('NotificationReceived', (notification: UserNotificationDto) => {
      this.notificationSubject.next(notification);
    });

    this.connection.onreconnected(() => this.connectedSignal.set(true));
    this.connection.onclose(() => this.connectedSignal.set(false));

    try {
      await this.connection.start();
      this.connectedSignal.set(true);
    } catch {
      this.connectedSignal.set(false);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      const conn = this.connection;
      this.connection = null;
      this.connectedSignal.set(false);
      try {
        await conn.stop();
      } catch {
        // Ignore teardown errors
      }
    }
  }
}
