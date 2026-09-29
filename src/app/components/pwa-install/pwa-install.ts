import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install.html',
  styleUrl: './pwa-install.css',
})
export class PwaInstallComponent {
  pwaService = inject(PwaService);

  onInstallClick(): void {
    this.pwaService.promptInstall();
  }

  onDismissClick(): void {
    this.pwaService.dismissBanner();
  }

  onCloseModal(): void {
    this.pwaService.closeInstallModal();
  }
}
