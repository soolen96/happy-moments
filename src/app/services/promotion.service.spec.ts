import { TestBed } from '@angular/core/testing';
import { PromotionService } from './promotion.service';
import { ConfigurationService } from './configuration.service';
import { Product, ProductCategory, DiscountPromotion } from '../models';
import { of } from 'rxjs';

describe('PromotionService - Day-based Discounts', () => {
  let service: PromotionService;

  const gomitasPower = new Product({
    id: 'p7',
    name: 'Gomitas Power',
    category: ProductCategory.Gomitas,
    price: 26000,
    badge: 'Power',
    weight: '4 unidades',
  });

  const chocolatesLite = new Product({
    id: 'p_1787523810273',
    name: 'Chocolates Lite',
    category: ProductCategory.Chocolates,
    price: 20000,
    badge: 'Lite',
    weight: '4 unidades',
  });

  const browniesFusionX2 = new Product({
    id: 'p8',
    name: 'Brownies Fusión',
    category: ProductCategory.Brownies,
    price: 26000,
    badge: 'Fusión',
    weight: '2 unidades',
  });

  const browniesFusionX1 = new Product({
    id: 'p9',
    name: 'Brownies Fusión',
    category: ProductCategory.Brownies,
    price: 15000,
    badge: 'Fusión',
    weight: '1 unidad',
  });

  const gomitasLite = new Product({
    id: 'p1',
    name: 'Gomitas Lite',
    category: ProductCategory.Gomitas,
    price: 20000,
    badge: 'Lite',
    weight: '4 unidades',
  });

  const chocolatesPower = new Product({
    id: 'p_1787526476972',
    name: 'Chocolates Power',
    category: ProductCategory.Chocolates,
    price: 26000,
    badge: 'Power',
    weight: '4 unidades',
  });

  const gomitasMix = new Product({
    id: 'p3',
    name: 'Gomitas Mix',
    category: ProductCategory.Gomitas,
    price: 24000,
    badge: 'Mix',
    weight: '4 unidades',
  });

  const otherProduct = new Product({
    id: 'p_other',
    name: 'Happy Greek',
    category: ProductCategory.Otros,
    price: 15000,
  });

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    const configServiceMock = {
      getConfig: () => of({}),
    };

    TestBed.configureTestingModule({
      providers: [
        PromotionService,
        { provide: ConfigurationService, useValue: configServiceMock },
      ],
    });

    service = TestBed.inject(PromotionService);
  });

  it('should load default promotions for Monday, Wednesday and Friday', () => {
    expect(service.promotions().length).toBe(3);
    const names = service.promotions().map((p) => p.name);
    expect(names.some((n) => n.includes('Lunes'))).toBe(true);
    expect(names.some((n) => n.includes('Miércoles'))).toBe(true);
    expect(names.some((n) => n.includes('Viernes'))).toBe(true);
  });

  describe('Monday (Lunes - day 1)', () => {
    beforeEach(() => {
      service.setSimulatedDay(1); // Lunes
    });

    it('should apply 10% discount on Gomitas Power ($26.000 -> $23.400)', () => {
      const discount = service.getDiscountForProduct(gomitasPower);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(23400);
      expect(discount.savings).toBe(2600);
      expect(service.getEffectivePrice(gomitasPower)).toBe(23400);
    });

    it('should apply 10% discount on Chocolates Lite ($20.000 -> $18.000)', () => {
      const discount = service.getDiscountForProduct(chocolatesLite);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(18000);
      expect(discount.savings).toBe(2000);
      expect(service.getEffectivePrice(chocolatesLite)).toBe(18000);
    });

    it('should NOT apply discount on other products on Monday', () => {
      expect(service.getDiscountForProduct(browniesFusionX2).hasDiscount).toBe(false);
      expect(service.getDiscountForProduct(gomitasMix).hasDiscount).toBe(false);
      expect(service.getDiscountForProduct(otherProduct).hasDiscount).toBe(false);
      expect(service.getEffectivePrice(otherProduct)).toBe(15000);
    });
  });

  describe('Wednesday (Miércoles - day 3)', () => {
    beforeEach(() => {
      service.setSimulatedDay(3); // Miércoles
    });

    it('should apply 10% discount on Brownies Fusión x2 ($26.000 -> $23.400)', () => {
      const discount = service.getDiscountForProduct(browniesFusionX2);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(23400);
      expect(discount.savings).toBe(2600);
      expect(service.getEffectivePrice(browniesFusionX2)).toBe(23400);
    });

    it('should NOT apply discount on Brownies Fusión x1 ($15.000)', () => {
      const discount = service.getDiscountForProduct(browniesFusionX1);
      expect(discount.hasDiscount).toBe(false);
      expect(service.getEffectivePrice(browniesFusionX1)).toBe(15000);
    });

    it('should apply 10% discount on Gomitas Lite ($20.000 -> $18.000)', () => {
      const discount = service.getDiscountForProduct(gomitasLite);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(18000);
      expect(discount.savings).toBe(2000);
    });

    it('should NOT apply discount on Gomitas Power on Wednesday', () => {
      expect(service.getDiscountForProduct(gomitasPower).hasDiscount).toBe(false);
    });
  });

  describe('Friday (Viernes - day 5)', () => {
    beforeEach(() => {
      service.setSimulatedDay(5); // Viernes
    });

    it('should apply 10% discount on Chocolates Power ($26.000 -> $23.400)', () => {
      const discount = service.getDiscountForProduct(chocolatesPower);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(23400);
      expect(discount.savings).toBe(2600);
      expect(service.getEffectivePrice(chocolatesPower)).toBe(23400);
    });

    it('should apply 10% discount on Gomitas Mix ($24.000 -> $21.600)', () => {
      const discount = service.getDiscountForProduct(gomitasMix);
      expect(discount.hasDiscount).toBe(true);
      expect(discount.discountPercentage).toBe(10);
      expect(discount.discountedPrice).toBe(21600);
      expect(discount.savings).toBe(2400);
      expect(service.getEffectivePrice(gomitasMix)).toBe(21600);
    });

    it('should NOT apply discount on Chocolates Lite on Friday', () => {
      expect(service.getDiscountForProduct(chocolatesLite).hasDiscount).toBe(false);
    });
  });

  describe('Non-promotional Days (e.g. Tuesday = 2, Sunday = 0)', () => {
    it('should not activate default discounts on Tuesday', () => {
      service.setSimulatedDay(2); // Martes
      expect(service.activePromotions().length).toBe(0);
      expect(service.getDiscountForProduct(gomitasPower).hasDiscount).toBe(false);
      expect(service.getDiscountForProduct(browniesFusionX2).hasDiscount).toBe(false);
      expect(service.getDiscountForProduct(chocolatesPower).hasDiscount).toBe(false);
    });

    it('should not activate default discounts on Sunday', () => {
      service.setSimulatedDay(0); // Domingo
      expect(service.activePromotions().length).toBe(0);
    });
  });

  describe('Date Range Promotions (Duration)', () => {
    it('should activate when now is within the range', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 60).toISOString();
      const future = new Date(now.getTime() + 1000 * 60 * 60).toISOString();

      const promo = new DiscountPromotion({
        id: 'date_promo_1',
        name: 'Flash Sale',
        discountPercentage: 20,
        productIds: ['p_other'],
        scheduleType: 'date_range',
        startDate: past,
        endDate: future,
        isActive: true,
      });

      expect(service.isPromotionActiveNow(promo)).toBe(true);
    });

    it('should not activate when the promotion has expired', () => {
      const now = new Date();
      const pastStart = new Date(now.getTime() - 1000 * 60 * 120).toISOString();
      const pastEnd = new Date(now.getTime() - 1000 * 60 * 60).toISOString();

      const promo = new DiscountPromotion({
        id: 'date_promo_2',
        name: 'Expired Sale',
        discountPercentage: 20,
        productIds: ['p_other'],
        scheduleType: 'date_range',
        startDate: pastStart,
        endDate: pastEnd,
        isActive: true,
      });

      expect(service.isPromotionActiveNow(promo)).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should add, update, pause and delete promotions', () => {
      const initialCount = service.promotions().length;

      const newPromo = service.addPromotion({
        name: 'Promo Test',
        discountPercentage: 15,
        productIds: ['p_other'],
        scheduleType: 'weekly_days',
        scheduledDays: [2],
      });

      expect(service.promotions().length).toBe(initialCount + 1);

      // Update
      service.updatePromotion(newPromo.id, { discountPercentage: 25 });
      const updated = service.promotions().find((p) => p.id === newPromo.id);
      expect(updated?.discountPercentage).toBe(25);

      // Pause / Toggle
      service.togglePromotionActive(newPromo.id);
      const toggled = service.promotions().find((p) => p.id === newPromo.id);
      expect(toggled?.isActive).toBe(false);

      // Delete
      service.deletePromotion(newPromo.id);
      expect(service.promotions().length).toBe(initialCount);
      expect(service.promotions().some((p) => p.id === newPromo.id)).toBe(false);
    });
  });
});
