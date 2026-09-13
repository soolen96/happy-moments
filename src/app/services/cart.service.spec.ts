import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { CartStorageService } from './cart-storage.service';
import { PromotionService } from './promotion.service';
import { ConfigurationService } from './configuration.service';
import { Product, ProductCategory } from '../models';
import { of } from 'rxjs';

describe('CartService - Flavor Selection & Discounts', () => {
  let service: CartService;

  const mockBrownie = new Product({
    id: 'p8',
    name: 'Brownies fusión x2 unidades',
    category: ProductCategory.Brownies,
    price: 26000,
    description: 'precio por unidad $ 15.000',
    flavors: ['Chocolate', 'Arequipe', 'Mixto'],
  });

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    TestBed.configureTestingModule({
      providers: [
        CartService,
        CartStorageService,
        PromotionService,
        {
          provide: ConfigurationService,
          useValue: { getConfig: () => of({}) },
        },
      ],
    });
    service = TestBed.inject(CartService);
    service.cart.set([]);
    // Ensure no discounts active by default during base tests
    service.promotionService.setSimulatedDay(2); // Martes (no discount)
  });

  it('should default to the first flavor if none is specified', () => {
    service.addToCart(mockBrownie);
    const items = service.cart();
    expect(items.length).toBe(1);
    expect(items[0].selectedFlavor).toBe('Chocolate');
    expect(items[0].quantity).toBe(1);
  });

  it('should add specific flavor and treat different flavors as separate items', () => {
    service.addToCart(mockBrownie, 'Arequipe');
    service.addToCart(mockBrownie, 'Chocolate');
    service.addToCart(mockBrownie, 'Arequipe');

    const items = service.cart();
    expect(items.length).toBe(2);

    const arequipeItem = items.find((i) => i.selectedFlavor === 'Arequipe');
    const chocolateItem = items.find((i) => i.selectedFlavor === 'Chocolate');

    expect(arequipeItem?.quantity).toBe(2);
    expect(chocolateItem?.quantity).toBe(1);
    expect(service.cartTotalCount()).toBe(3);
    expect(service.cartSubtotalPrice()).toBe(26000 * 3);
    expect(service.cartDeliveryFee()).toBe(10000);
    expect(service.cartTotalPrice()).toBe(26000 * 3 + 10000);
    expect(service.hasFreeGummyReward()).toBe(true);
  });

  it('should update quantity for a specific flavor', () => {
    service.addToCart(mockBrownie, 'Arequipe');
    service.addToCart(mockBrownie, 'Chocolate');

    service.updateQuantity('p8', 1, 'Arequipe');
    const arequipeItem = service.cart().find((i) => i.selectedFlavor === 'Arequipe');
    expect(arequipeItem?.quantity).toBe(2);

    service.removeFromCart('p8', 'Arequipe');
    expect(service.cart().length).toBe(1);
    expect(service.cart()[0].selectedFlavor).toBe('Chocolate');
  });

  it('should include selected flavor in WhatsApp checkout message', () => {
    service.addToCart(mockBrownie, 'Arequipe');
    const url = service.getWhatsAppUrl({
      whatsapp: '+57 314 4882666',
      phone: '',
      location: '',
      email: '',
      schedule: '',
      instagram: '',
    });

    expect(url).toContain('Brownies%20fusi%C3%B3n%20x2%20unidades%20(Sabor%3A%20Arequipe)');
  });

  describe('Discount calculations in Cart', () => {
    it('should calculate discounted subtotal and total savings on promotional days', () => {
      // Simulate Wednesday (Miércoles = day 3) where Brownies x2 has 10% OFF
      service.promotionService.setSimulatedDay(3);
      service.addToCart(mockBrownie, 'Chocolate');

      expect(service.cartOriginalSubtotalPrice()).toBe(26000);
      expect(service.cartSubtotalPrice()).toBe(23400); // 10% OFF
      expect(service.cartTotalSavings()).toBe(2600);
      expect(service.cartTotalPrice()).toBe(23400 + 10000);
    });

    it('should include promotional discount details in WhatsApp message', () => {
      service.promotionService.setSimulatedDay(3); // Wednesday
      service.addToCart(mockBrownie, 'Chocolate');

      const url = service.getWhatsAppUrl({
        whatsapp: '+57 314 4882666',
        phone: '',
        location: '',
        email: '',
        schedule: '',
        instagram: '',
      });

      expect(url).toContain('10%25%20OFF');
      expect(url).toContain('23.400');
    });
  });
});
