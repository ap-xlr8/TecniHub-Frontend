import { Injectable, signal } from '@angular/core';

export interface GlobalErrorState {
  code: 'offline' | 'server';
  status: number;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalErrorService {
  private readonly errorSignal = signal<GlobalErrorState | null>(null);
  readonly error = this.errorSignal.asReadonly();

  reportNetworkError(): void {
    this.errorSignal.set({
      code: 'offline',
      status: 0,
      title: 'Sin respuesta del servidor',
      message:
        'No fue posible conectar con TECNIHUB. Verifica tu conexión a internet o intenta nuevamente en unos momentos.',
    });
  }

  reportServerError(status: number, customMessage?: string): void {
    this.errorSignal.set({
      code: 'server',
      status,
      title: `Error del servidor (${status})`,
      message:
        customMessage ||
        'Ocurrió un problema temporal en el servidor. Tus datos no se perdieron; intenta de nuevo en unos momentos.',
    });
  }

  dismiss(): void {
    this.errorSignal.set(null);
  }
}
