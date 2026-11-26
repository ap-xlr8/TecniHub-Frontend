import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ChatConversationSummaryDto, ChatMessageDto } from '../../core/models/operations.models';
import { ChatService } from '../../core/services/chat.service';
import { AppShellComponent } from '../../shared/layout/app-shell.component';

@Component({
  selector: 'app-chat-inbox',
  imports: [AppShellComponent, RouterLink, FormsModule, DatePipe],
  template: `
    <app-shell>
      <section class="panel-card" aria-labelledby="chat-heading">
        <h1 id="chat-heading" class="page-title">Mensajes</h1>
        <p class="page-lead" style="margin: 0">
          Conversaciones privadas vinculadas a tus reparaciones asignadas o publicaciones de
          refacciones.
        </p>
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
                <div style="display: flex; justify-content: space-between; gap: 0.5rem">
                  <strong>{{ conv.counterpartDisplayName }}</strong>
                  @if (conv.unreadCount > 0) {
                    <span class="unread-badge">{{ conv.unreadCount }}</span>
                  }
                </div>
                <span style="font-size: 0.84rem; color: var(--th-primary); font-weight: 600">
                  {{ conv.contextTitle }} · {{ conv.contextStatusLabel }}
                </span>
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
                <div>
                  <h2 style="margin: 0; font-size: 1.05rem">
                    {{ active.counterpartDisplayName }} ({{ active.counterpartRoleLabel }})
                  </h2>
                  <p class="field-hint" style="margin: 0">
                    {{ active.contextTitle }} · Estado: {{ active.contextStatusLabel }}
                  </p>
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
                      <p class="chat-bubble-body">{{ msg.body }}</p>
                      <span class="chat-bubble-meta">
                        {{ msg.isMine ? 'Tú' : msg.senderDisplayName }} ·
                        {{ msg.sentAt | date: 'short' }}
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
                <form class="chat-composer" (ngSubmit)="sendMessage()">
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
                    [disabled]="sending() || !draftBody.trim()"
                  >
                    {{ sending() ? 'Enviando...' : 'Enviar' }}
                  </button>
                </form>
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
  private readonly auth = inject(AuthService);

  private readonly messagesViewportRef = viewChild<ElementRef<HTMLDivElement>>('messagesViewport');

  protected readonly loadingList = signal(true);
  protected readonly loadingMessages = signal(false);
  protected readonly sending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly conversations = signal<ChatConversationSummaryDto[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly activeConversation = signal<ChatConversationSummaryDto | null>(null);
  protected readonly messages = signal<ChatMessageDto[]>([]);
  protected draftBody = '';

  private routeSub: Subscription | null = null;
  private pollTimerId: ReturnType<typeof setInterval> | null = null;
  private lastCompositionEndAt: number | null = null;

  ngOnInit(): void {
    this.loadConversations();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.selectedId.set(id);
      if (id) {
        this.loadThread(id, false);
      } else {
        this.activeConversation.set(null);
        this.messages.set([]);
      }
    });

    this.pollTimerId = setInterval(() => {
      const id = this.selectedId();
      if (id && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
        this.loadThread(id, true);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.pollTimerId !== null) {
      clearInterval(this.pollTimerId);
    }
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
      if (
        this.lastCompositionEndAt !== null &&
        Math.abs(event.timeStamp - this.lastCompositionEndAt) < 50
      ) {
        return;
      }
      this.sendMessage();
    }
  }

  protected sendMessage(): void {
    const id = this.selectedId();
    const trimmed = this.draftBody.trim();
    if (!id || !trimmed || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set(null);
    this.chat.sendMessage(id, trimmed).subscribe({
      next: (msg) => {
        this.sending.set(false);
        this.draftBody = '';
        this.messages.update((curr) => [...curr, msg]);
        this.scrollToBottom();
        this.loadConversations(true);
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

  private loadConversations(silent = false): void {
    if (!silent) {
      this.loadingList.set(true);
    }

    this.chat.getConversations().subscribe({
      next: (list) => {
        this.conversations.set(list);
        this.loadingList.set(false);
      },
      error: (err: unknown) => {
        this.loadingList.set(false);
        if (!silent) {
          this.errorMessage.set(this.auth.extractErrorMessage(err));
        }
      },
    });
  }

  private loadThread(conversationId: string, incremental: boolean): void {
    if (!incremental) {
      this.loadingMessages.set(true);
      this.errorMessage.set(null);
    }

    const currentMessages = this.messages();
    const afterUtc =
      incremental && currentMessages.length > 0
        ? currentMessages[currentMessages.length - 1].sentAt
        : undefined;

    this.chat.getMessages(conversationId, afterUtc).subscribe({
      next: (thread) => {
        this.loadingMessages.set(false);
        this.activeConversation.set(thread.conversation);
        if (incremental && afterUtc) {
          if (thread.messages.length > 0) {
            const existingIds = new Set(currentMessages.map((m) => m.id));
            const merged = [
              ...currentMessages,
              ...thread.messages.filter((m) => !existingIds.has(m.id)),
            ];
            this.messages.set(merged);
            this.scrollToBottom();
          }
        } else {
          this.messages.set(thread.messages);
          this.scrollToBottom();
        }
        this.chat.refreshUnreadCount().subscribe({ error: () => undefined });
      },
      error: (err: unknown) => {
        this.loadingMessages.set(false);
        if (!incremental) {
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
