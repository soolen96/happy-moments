export type DiscountScheduleType = 'weekly_days' | 'date_range';

export interface ProductDiscountInfo {
  hasDiscount: boolean;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  badge?: string;
  promotionName?: string;
  promotionId?: string;
}

export class DiscountPromotion {
  id: string;
  name: string;
  description?: string;
  discountPercentage: number;
  productIds: string[];
  scheduleType: DiscountScheduleType;
  scheduledDays?: number[]; // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  startDate?: string;
  endDate?: string;
  badgeText?: string;
  isActive: boolean;

  constructor(init?: Partial<DiscountPromotion>) {
    this.id = init?.id ?? 'promo_' + Date.now();
    this.name = init?.name ?? '';
    this.description = init?.description ?? '';
    this.discountPercentage = init?.discountPercentage ?? 10;
    this.productIds = init?.productIds ? [...init.productIds] : [];
    this.scheduleType = init?.scheduleType ?? 'weekly_days';
    this.scheduledDays = init?.scheduledDays ? [...init.scheduledDays] : [];
    this.startDate = init?.startDate;
    this.endDate = init?.endDate;
    this.badgeText = init?.badgeText;
    this.isActive = init?.isActive ?? true;
  }
}
