import { Injectable, signal, computed, inject } from '@angular/core';
import { DiscountPromotion, ProductDiscountInfo, Product } from '../models';
import { ConfigurationService } from './configuration.service';

export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const DEFAULT_PROMOTIONS: DiscountPromotion[] = [
  new DiscountPromotion({
    id: 'promo_lunes',
    name: 'Lunes Especial (10% OFF)',
    description: '10% de descuento en Gomitas Power y Chocolates Lite',
    discountPercentage: 10,
    productIds: ['p7', 'p_1787523810273'],
    scheduleType: 'weekly_days',
    scheduledDays: [1], // 1 = Lunes
    badgeText: '10% OFF HOY',
    isActive: true,
  }),
  new DiscountPromotion({
    id: 'promo_miercoles',
    name: 'Miércoles Dulce (10% OFF)',
    description: '10% de descuento en Brownies Fusión x2 y Gomitas Lite',
    discountPercentage: 10,
    productIds: ['p8', 'p1'],
    scheduleType: 'weekly_days',
    scheduledDays: [3], // 3 = Miércoles
    badgeText: '10% OFF HOY',
    isActive: true,
  }),
  new DiscountPromotion({
    id: 'promo_viernes',
    name: 'Viernes Power (10% OFF)',
    description: '10% de descuento en Chocolates Power y Gomitas Mix',
    discountPercentage: 10,
    productIds: ['p_1787526476972', 'p3'],
    scheduleType: 'weekly_days',
    scheduledDays: [5], // 5 = Viernes
    badgeText: '10% OFF HOY',
    isActive: true,
  }),
];

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private configService = inject(ConfigurationService);
  private readonly STORAGE_KEY = 'happy_moments_promotions_override';

  promotions = signal<DiscountPromotion[]>([]);
  // Simulated day of week (null = real current day; 0=Dom, 1=Lun, etc.)
  simulatedDay = signal<number | null>(null);

  // Active promotions right now
  activePromotions = computed(() => {
    return this.promotions().filter((promo) => this.isPromotionActiveNow(promo));
  });

  // Current effective day name
  currentDayName = computed(() => {
    const day = this.getCurrentDayOfWeek();
    return DAY_NAMES[day];
  });

  // Schedule summary for weekly deals
  weeklySchedule = computed(() => {
    const all = this.promotions().filter(
      (p) => p.isActive && p.scheduleType === 'weekly_days' && p.scheduledDays && p.scheduledDays.length > 0
    );

    // Group by day 1 (Lunes), 3 (Miércoles), 5 (Viernes), etc.
    const days = [1, 2, 3, 4, 5, 6, 0];
    return days
      .map((dayNum) => {
        const promosForDay = all.filter((p) => p.scheduledDays?.includes(dayNum));
        return {
          dayNumber: dayNum,
          dayName: DAY_NAMES[dayNum],
          promotions: promosForDay,
          isToday: dayNum === this.getCurrentDayOfWeek(),
        };
      })
      .filter((d) => d.promotions.length > 0);
  });

  constructor() {
    this.loadPromotions();
  }

  loadPromotions(): void {
    let loadedFromLocal = false;

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.promotions.set(parsed.map((item) => new DiscountPromotion(item)));
            loadedFromLocal = true;
          }
        } catch (e) {
          console.error('Error parsing local promotions override:', e);
        }
      }
    }

    if (!loadedFromLocal) {
      this.configService.getConfig().subscribe({
        next: (config: any) => {
          if (config?.promotions && Array.isArray(config.promotions) && config.promotions.length > 0) {
            this.promotions.set(config.promotions.map((p: any) => new DiscountPromotion(p)));
          } else {
            this.promotions.set([...DEFAULT_PROMOTIONS]);
          }
        },
        error: () => {
          this.promotions.set([...DEFAULT_PROMOTIONS]);
        },
      });
    }
  }

  savePromotionsToStorage(items: DiscountPromotion[]): void {
    this.promotions.set(items);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving promotions override:', e);
      }
    }
  }

  // --- CRUD METHODS FOR ADMIN ---
  addPromotion(newPromo: Partial<DiscountPromotion>): DiscountPromotion {
    const id = 'promo_' + Date.now();
    const promo = new DiscountPromotion({
      ...newPromo,
      id,
    });

    const updated = [promo, ...this.promotions()];
    this.savePromotionsToStorage(updated);
    return promo;
  }

  updatePromotion(id: string, updatedData: Partial<DiscountPromotion>): void {
    const updated = this.promotions().map((p) =>
      p.id === id ? new DiscountPromotion({ ...p, ...updatedData }) : p
    );
    this.savePromotionsToStorage(updated);
  }

  deletePromotion(id: string): void {
    const updated = this.promotions().filter((p) => p.id !== id);
    this.savePromotionsToStorage(updated);
  }

  togglePromotionActive(id: string): void {
    const promo = this.promotions().find((p) => p.id === id);
    if (promo) {
      this.updatePromotion(id, { isActive: !promo.isActive });
    }
  }

  duplicatePromotion(id: string): void {
    const promo = this.promotions().find((p) => p.id === id);
    if (promo) {
      this.addPromotion({
        ...promo,
        name: `${promo.name} (Copia)`,
      });
    }
  }

  resetToDefault(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.promotions.set([...DEFAULT_PROMOTIONS]);
  }

  // --- DAY SIMULATION & TIME EVALUATION ---
  setSimulatedDay(day: number | null): void {
    this.simulatedDay.set(day);
  }

  getCurrentDayOfWeek(): number {
    const sim = this.simulatedDay();
    if (sim !== null && sim >= 0 && sim <= 6) {
      return sim;
    }
    return new Date().getDay();
  }

  isPromotionActiveNow(promo: DiscountPromotion): boolean {
    if (!promo.isActive) {
      return false;
    }

    if (promo.scheduleType === 'weekly_days') {
      const currentDay = this.getCurrentDayOfWeek();
      return (promo.scheduledDays || []).includes(currentDay);
    }

    if (promo.scheduleType === 'date_range') {
      const now = new Date();
      if (promo.startDate) {
        const start = new Date(promo.startDate);
        if (!isNaN(start.getTime()) && now < start) {
          return false;
        }
      }
      if (promo.endDate) {
        const end = new Date(promo.endDate);
        if (!isNaN(end.getTime()) && now > end) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // --- PRODUCT MATCHING & DISCOUNT CALCULATION ---
  private matchesProduct(promo: DiscountPromotion, product: Product): boolean {
    if (promo.productIds.includes(product.id)) {
      return true;
    }

    // Robust fallback by product characteristics if IDs were changed or copied
    const lowerName = product.name.toLowerCase();
    const lowerWeight = (product.weight || '').toLowerCase();
    const lowerBadge = (product.badge || '').toLowerCase();

    for (const pid of promo.productIds) {
      // Gomitas Power
      if (pid === 'p7' && lowerName.includes('gomita') && (lowerName.includes('power') || lowerBadge.includes('power'))) {
        return true;
      }
      // Chocolates Lite
      if (pid === 'p_1787523810273' && lowerName.includes('chocolate') && (lowerName.includes('lite') || lowerBadge.includes('lite'))) {
        return true;
      }
      // Brownies Fusión x2
      if (
        pid === 'p8' &&
        lowerName.includes('brownie') &&
        (lowerWeight.includes('2') || lowerName.includes('x2') || lowerName.includes('2 unidades'))
      ) {
        return true;
      }
      // Gomitas Lite
      if (pid === 'p1' && lowerName.includes('gomita') && (lowerName.includes('lite') || lowerBadge.includes('lite'))) {
        return true;
      }
      // Chocolates Power
      if (pid === 'p_1787526476972' && lowerName.includes('chocolate') && (lowerName.includes('power') || lowerBadge.includes('power'))) {
        return true;
      }
      // Gomitas Mix
      if (pid === 'p3' && lowerName.includes('gomita') && (lowerName.includes('mix') || lowerBadge.includes('mix'))) {
        return true;
      }
    }

    return false;
  }

  getDiscountForProduct(product: Product): ProductDiscountInfo {
    const active = this.activePromotions();

    // Find the highest applicable discount
    let bestDiscountPromo: DiscountPromotion | null = null;
    let highestDiscount = 0;

    for (const promo of active) {
      if (this.matchesProduct(promo, product)) {
        if (promo.discountPercentage > highestDiscount) {
          highestDiscount = promo.discountPercentage;
          bestDiscountPromo = promo;
        }
      }
    }

    if (!bestDiscountPromo || highestDiscount <= 0) {
      return {
        hasDiscount: false,
        discountPercentage: 0,
        originalPrice: product.price,
        discountedPrice: product.price,
        savings: 0,
      };
    }

    const originalPrice = product.price;
    const discountedPrice = Math.round(originalPrice * (1 - highestDiscount / 100));
    const savings = originalPrice - discountedPrice;
    const badge = bestDiscountPromo.badgeText || `${highestDiscount}% OFF`;

    return {
      hasDiscount: true,
      discountPercentage: highestDiscount,
      originalPrice,
      discountedPrice,
      savings,
      badge,
      promotionName: bestDiscountPromo.name,
      promotionId: bestDiscountPromo.id,
    };
  }

  getEffectivePrice(product: Product): number {
    return this.getDiscountForProduct(product).discountedPrice;
  }
}
