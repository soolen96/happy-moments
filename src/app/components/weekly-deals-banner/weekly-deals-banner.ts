import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService, DAY_NAMES } from '../../services/promotion.service';

@Component({
  selector: 'app-weekly-deals-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-deals-banner.html',
  styleUrl: './weekly-deals-banner.css',
})
export class WeeklyDealsBannerComponent {
  promotionService = inject(PromotionService);

  showScheduleModal = signal<boolean>(false);
  showSimulator = signal<boolean>(false);

  dayOptions = [
    { label: 'Tiempo Real', value: null },
    { label: 'Lunes (10% OFF)', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles (10% OFF)', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes (10% OFF)', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 0 },
  ];

  setDay(day: number | null): void {
    this.promotionService.setSimulatedDay(day);
  }

  toggleSchedule(): void {
    this.showScheduleModal.update((v) => !v);
  }

  toggleSimulator(): void {
    this.showSimulator.update((v) => !v);
  }
}
