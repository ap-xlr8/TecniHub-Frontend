import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { GlobalErrorService } from './core/errors/global-error.service';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly globalErrors = inject(GlobalErrorService);

  protected reloadPage(): void {
    this.globalErrors.dismiss();
    globalThis.location?.reload();
  }
}
