import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GlobalErrorService } from './core/errors/global-error.service';
import { LoadingStateService } from './core/ui/loading-state.service';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly globalErrors = inject(GlobalErrorService);
  protected readonly loadingState = inject(LoadingStateService);

  protected reloadPage(): void {
    this.globalErrors.dismiss();
    globalThis.location?.reload();
  }
}
