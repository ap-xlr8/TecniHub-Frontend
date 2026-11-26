import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ChatConversationSummaryDto, ChatMessageDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { MediaService } from '../../core/services/media.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { UserAvatarComponent } from '../../shared/components/user-avatar.component';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-chat-inbox',
  imports: [AppShellComponent, RouterLink, FormsModule, DatePipe, UserAvatarComponent],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="chat-heading">
        <div class="page-header-row">
          <div>
            <h1 id="chat-heading" class="page-title">Mensajes</h1>
            <p class="page-lead" style="margin: 0">
              Conversaciones privadas en tiempo real vinculadas a tus reparaciones o refacciones.
            </p>
          </div>
          @if (realtime.connected()) {
            <span class="status-badge status-badge--completed">En vivo</span>
          }
        </div>
      </section>

      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">{{ errorMessage() }}</div>
      }

      @if (loadingList()) {
        <section class="panel-card"><p class="muted-value">Cargando conversaciones...</p></section>
      } @else if (conversations().length === 0) {
        <section class="empty-state">
          <h2>Aún no tienes conversaciones activas</h2>
          <p>
            El chat se habilita automáticamente cuando un técnico acepta una reparación o cuando
            inicias contacto desde una publicación de refacción.
          </p>
        </section>
      } @else {
        <div class="chat-layout">
          <aside class="chat-list" aria-label="Lista de conversaciones">
            @for (conv of conversations(); track conv.id) {
              <a
                [routerLink]="['/mensajes', conv.id]"
                class="chat-list-item"
                [class.chat-list-item--active]="selectedId() === conv.id"
              >
                <div style="display: flex; align-items: center; gap: 0.6rem">
                  <app-user-avatar
                    [name]="conv.counterpartDisplayName"
                    [avatarUrl]="conv.counterpartAvatarUrl"
                    size="sm"
                  />
                  <div style="flex: 1; min-inline-size: 0">
                    <div style="display: flex; justify-content: space-between; gap: 0.5rem">
                      <strong>{{ conv.counterpartDisplayName }}</strong>
                      @if (conv.unreadCount > 0) {
                        <span class="unread-badge">{{ conv.unreadCount }}</span>
                      }
                    </div>
                    <span style="font-size: 0.82rem; color: var(--th-primary); font-weight: 600">
                      {{ conv.contextTitle }} · {{ conv.contextStatusLabel }}
                    </span>
                  </div>
                </div>
                @if (conv.lastMessagePreview) {
                  <span class="field-hint">{{ conv.lastMessagePreview }}</span>
                } @else {
                  <span class="field-hint">Sin mensajes todavía</span>
                }
              </a>
            }
          </aside>

          @if (activeConversation(); as active) {
            <section class="chat-thread" aria-label="Hilo de conversación">
              <header class="chat-thread-header">
                <div style="display: flex; align-items: center; gap: 0.7rem">
                  <app-user-avatar
                    [name]="active.counterpartDisplayName"
                    [avatarUrl]="active.counterpartAvatarUrl"
                    size="sm"
                  />
                  <div>
                    <h2 style="margin: 0; font-size: 1.05rem">
                      {{ active.counterpartDisplayName }} ({{ active.counterpartRoleLabel }})
                    </h2>
                    <p class="field-hint" style="margin: 0">
                      {{ active.contextTitle }} · Estado: {{ active.contextStatusLabel }}
                    </p>
                  </div>
                </div>
                <a class="btn btn-secondary btn-sm" [routerLink]="getContextLink(active)">
                  Ver detalle
                </a>
              </header>

              <div #messagesViewport class="chat-messages" aria-live="polite">
                @if (loadingMessages()) {
                  <p class="muted-value" style="margin: auto">Cargando mensajes...</p>
                } @else if (messages().length === 0) {
                  <p class="muted-value" style="margin: auto; text-align: center">
                    Todavía no hay mensajes en esta conversación. Escribe el primero para coordinar
                    detalles.
                  </p>
                } @else {
                  @for (msg of messages(); track msg.id) {
                    <article class="chat-bubble" [class.chat-bubble--mine]="msg.isMine">
                      @if (msg.imageUrl) {
                        <img
                          [src]="msg.imageUrl"
                          alt="Fotografía enviada en el chat"
                          class="chat-bubble-img"
                          loading="lazy"
                        />
                      }
                      @if (msg.body) {
                        <p class="chat-bubble-body">{{ msg.body }}</p>
                      }
                      <span class="chat-bubble-meta">
                        {{ msg.isMine ? 'Tú' : msg.senderDisplayName }} ·
                        {{ msg.sentAt | date: 'short' }}
                        @if (msg.isMine && msg.readAt) {
                          · Leído
                        }
                      </span>
                    </article>
                  }
                }
              </div>

              @if (active.isReadOnly) {
                <div class="alert alert-info" style="margin: 0; border-radius: 0; border-inline: 0">
                  Esta conversación está en modo solo lectura porque el servicio concluyó o la
                  cuenta ya no está activa.
                </div>
              } @else {
                <div>
                  @if (pendingImageUrl()) {
                    <div
                      style="
                        padding: 0.5rem 1rem 0;
                        display: flex;
                        align-items: center;
                        gap: 0.65rem;
                      "
                    >
                      <img
                        [src]="pendingImageUrl()!"
                        alt="Vista previa adjunta"
                        style="
                          inline-size: 3.5rem;
                          block-size: 3.5rem;
                          object-fit: cover;
                          border-radius: 0.4rem;
                          border: 1px solid var(--th-border);
                        "
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        (click)="pendingImageUrl.set(null)"
                      >
                        Quitar foto
                      </button>
                    </div>
                  }

                  <form class="chat-composer" (ngSubmit)="sendMessage()">
                    <input
                      #chatImageInput
                      id="chat-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="visually-hidden"
                      (change)="onChatImageSelected($event)"
                    />
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      aria-label="Adjuntar fotografía"
                      [disabled]="uploadingImage() || sending()"
                      (click)="chatImageInput.click()"
                    >
                      {{ uploadingImage() ? '...' : '📷' }}
                    </button>

                    <label for="chat-body-input" class="visually-hidden">Escribe tu mensaje</label>
                    <textarea
                      id="chat-body-input"
                      name="draftBody"
                      class="input-control"
                      rows="2"
                      maxlength="1000"
                      placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
                      [(ngModel)]="draftBody"
                      (compositionend)="onCompositionEnd($event)"
                      (keydown)="onTextareaKeydown($event)"
                    ></textarea>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="sending() || (!draftBody.trim() && !pendingImageUrl())"
                    >
                      {{ sending() ? 'Enviando...' : 'Enviar' }}
                    </button>
                  </form>
                </div>
              }
            </section>
          } @else {
            <section class="empty-state">
              <h2>Selecciona una conversación</h2>
              <p>Elige un chat de la lista para consultar el historial o enviar un mensaje.</p>
            </section>
          }
        </div>
      }
    </app-shell>
  `,
})
export class ChatInboxComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly chat = inject(ChatService);
  private readonly media = inject(MediaService);
  private readonly auth = inject(AuthService);
  protected readonly realtime = inject(RealtimeService);

  private readonly messagesViewportRef = viewChild<ElementRef<HTMLDivElement>>('messagesViewport');

  protected readonly loadingList = signal(true);
  protected readonly loadingMessages = signal(false);
  protected readonly sending = signal(false);
  protected readonly uploadingImage = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly conversations = signal<ChatConversationSummaryDto[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly activeConversation = signal<ChatConversationSummaryDto | null>(null);
  protected readonly messages = signal<ChatMessageDto[]>([]);
  protected readonly pendingImageUrl = signal<string | null>(null);
  protected draftBody = '';

  private readonly subs = new Subscription();
  private lastCompositionEndAt: number | null = null;

  ngOnInit(): void {
    this.loadConversations();
    void this.realtime.ensureConnected();

    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        this.selectedId.set(id);
        this.pendingImageUrl.set(null);
        if (id) {
          this.loadThread(id, false);
        } else {
          this.activeConversation.set(null);
          this.messages.set([]);
        }
      }),
    );

    this.subs.add(
      this.realtime.chatMessage$.subscribe((incoming) => {
        if (incoming.conversationId === this.selectedId()) {
          this.messages.update((current) =>
            current.some((m) => m.id === incoming.id) ? current : [...current, incoming],
          );
          this.scrollToBottom();
          // Mark read immediately on server
          this.chat.getMessages(incoming.conversationId).subscribe({ error: () => undefined });
        }
        this.loadConversations();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected onCompositionEnd(event: CompositionEvent): void {
    this.lastCompositionEndAt = event.timeStamp;
  }

  protected onTextareaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (event.isComposing) {
        return;
      }
      if (this.lastCompositionEndAt !== null && event.timeStamp - this.lastCompositionEndAt < 60) {
        return;
      }
      this.sendMessage();
    }
  }

  protected onChatImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('La imagen no debe superar 5 MB.');
      return;
    }

    this.uploadingImage.set(true);
    this.errorMessage.set(null);
    this.media.uploadImage(file, file.name).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        this.pendingImageUrl.set(res.imageUrl);
      },
      error: (err: unknown) => {
        this.uploadingImage.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected sendMessage(): void {
    const convId = this.selectedId();
    const body = this.draftBody.trim();
    const img = this.pendingImageUrl();
    if (!convId || (!body && !img) || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set(null);
    this.chat.sendMessage(convId, body, img).subscribe({
      next: (created) => {
        this.sending.set(false);
        this.draftBody = '';
        this.pendingImageUrl.set(null);
        this.messages.update((list) =>
          list.some((m) => m.id === created.id) ? list : [...list, created],
        );
        this.loadConversations();
        this.scrollToBottom();
      },
      error: (err: unknown) => {
        this.sending.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  protected getContextLink(conv: ChatConversationSummaryDto): string[] {
    if (conv.contextType === 'SparePart') {
      return ['/tecnico/refacciones', conv.contextId];
    }
    return this.auth.userRole() === 'Technician'
      ? ['/tecnico/servicios', conv.contextId]
      : ['/cliente/solicitudes', conv.contextId];
  }

  private loadConversations(): void {
    this.chat.getConversations().subscribe({
      next: (list) => {
        this.conversations.set(list);
        this.loadingList.set(false);
        this.chat.refreshUnreadCount().subscribe({ error: () => undefined });
      },
      error: (err: unknown) => {
        this.loadingList.set(false);
        this.errorMessage.set(this.auth.extractErrorMessage(err));
      },
    });
  }

  private loadThread(conversationId: string, silent: boolean): void {
    if (!silent) {
      this.loadingMessages.set(true);
      this.errorMessage.set(null);
    }

    this.chat.getMessages(conversationId).subscribe({
      next: (thread) => {
        this.activeConversation.set(thread.conversation);
        this.messages.set(thread.messages);
        this.loadingMessages.set(false);
        this.chat.refreshUnreadCount().subscribe({ error: () => undefined });
        this.scrollToBottom();
      },
      error: (err: unknown) => {
        this.loadingMessages.set(false);
        if (!silent) {
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        }
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesViewportRef()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 20);
  }
}
