import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService } from '../../services/promotion.service';

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

  dayOptions = computed(() => {
    const promos = this.promotionService.promotions();
    const dayMap = new Map<number, number>();

    for (const p of promos) {
      if (p.isActive && p.scheduleType === 'weekly_days' && p.scheduledDays) {
        for (const d of p.scheduledDays) {
          const current = dayMap.get(d) || 0;
          if (p.discountPercentage > current) {
            dayMap.set(d, p.discountPercentage);
          }
        }
      }
    }

    const baseDays = [
      { label: 'Tiempo Real', value: null },
      { label: 'Lunes', value: 1 },
      { label: 'Martes', value: 2 },
      { label: 'Miércoles', value: 3 },
      { label: 'Jueves', value: 4 },
      { label: 'Viernes', value: 5 },
      { label: 'Sábado', value: 6 },
      { label: 'Domingo', value: 0 },
    ];

    return baseDays.map((d) => {
      if (d.value !== null && dayMap.has(d.value)) {
        return {
          label: `${d.label} (${dayMap.get(d.value)}% OFF)`,
          value: d.value,
        };
      }
      return d;
    });
  });

  weeklyPromosSummary = computed(() => {
    const schedule = this.promotionService.weeklySchedule();
    if (schedule.length === 0) {
      return 'Consulta nuestras promociones especiales cada semana';
    }
    return schedule
      .map((item) => {
        const promoDetails = item.promotions
          .map((p) => {
            if (p.description) {
              return p.description;
            }
            return `${p.name} (-${p.discountPercentage}%)`;
          })
          .join(' / ');
        return `${item.dayName} (${promoDetails})`;
      })
      .join(' • ');
  });

  scheduleSubtitleText = computed(() => {
    const schedule = this.promotionService.weeklySchedule();
    if (schedule.length === 0) {
      return 'Aprovecha nuestras ofertas y promociones programadas durante la semana:';
    }
    const days = schedule.map((s) => s.dayName.toLowerCase()).join(' y ');
    return `Aprovecha nuestras ofertas fijas todos los ${days} del año:`;
  });

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

