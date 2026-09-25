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
    name: 'Brownies Fusión',
    category: ProductCategory.Brownies,
    price: 26000,
    unitPrice: 15000,
    weight: '2 unidades',
    description: 'Brownie artesanal de chocolate con galleta Oreo',
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
    // Ensure no discounts active by default during base tests (Sunday = 0)
    service.promotionService.setSimulatedDay(0);
  });

  it('should default to the first flavor and combo presentation if none is specified', () => {
    service.addToCart(mockBrownie);
    const items = service.cart();
    expect(items.length).toBe(1);
    expect(items[0].selectedFlavor).toBe('Chocolate');
    expect(items[0].selectedPresentation).toBe('combo');
    expect(items[0].quantity).toBe(1);
    expect(service.getItemBasePrice(items[0])).toBe(26000);
  });

  it('should support buying by unit at unitPrice', () => {
    service.addToCart(mockBrownie, 'Arequipe', 'unit');
    const items = service.cart();
    expect(items.length).toBe(1);
    expect(items[0].selectedFlavor).toBe('Arequipe');
    expect(items[0].selectedPresentation).toBe('unit');
    expect(service.getItemBasePrice(items[0])).toBe(15000);
    expect(service.cartSubtotalPrice()).toBe(15000);
  });

  it('should allow unit and combo of the same product as separate cart items', () => {
    service.addToCart(mockBrownie, 'Chocolate', 'unit');
    service.addToCart(mockBrownie, 'Chocolate', 'combo');

    const items = service.cart();
    expect(items.length).toBe(2);

    const unitItem = items.find((i) => i.selectedPresentation === 'unit');
    const comboItem = items.find((i) => i.selectedPresentation === 'combo');

    expect(unitItem).toBeDefined();
    expect(comboItem).toBeDefined();
    expect(service.getItemBasePrice(unitItem!)).toBe(15000);
    expect(service.getItemBasePrice(comboItem!)).toBe(26000);
    expect(service.cartSubtotalPrice()).toBe(15000 + 26000);
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

  it('should update quantity for a specific flavor and presentation', () => {
    service.addToCart(mockBrownie, 'Arequipe', 'unit');
    service.addToCart(mockBrownie, 'Arequipe', 'combo');

    service.updateQuantity('p8', 1, 'Arequipe', 'unit');
    const unitItem = service.cart().find((i) => i.selectedPresentation === 'unit');
    const comboItem = service.cart().find((i) => i.selectedPresentation === 'combo');

    expect(unitItem?.quantity).toBe(2);
    expect(comboItem?.quantity).toBe(1);

    service.removeFromCart('p8', 'Arequipe', 'unit');
    expect(service.cart().length).toBe(1);
    expect(service.cart()[0].selectedPresentation).toBe('combo');
  });

  it('should include selected presentation and flavor in WhatsApp checkout message', () => {
    service.addToCart(mockBrownie, 'Arequipe', 'unit');
    const url = service.getWhatsAppUrl({
      whatsapp: '+57 314 4882666',
      phone: '',
      location: '',
      email: '',
      schedule: '',
      instagram: '',
    });

    expect(url).toContain('Brownies%20Fusi%C3%B3n');
    expect(url).toContain('Unidad');
    expect(url).toContain('Arequipe');
    expect(url).toContain('15.000');
  });

  describe('Discount calculations in Cart', () => {
    it('should calculate discounted subtotal and total savings on promotional days (Martes = 2)', () => {
      // Simulate Tuesday (Martes = day 2) where Brownies has 10% OFF
      service.promotionService.setSimulatedDay(2);
      service.addToCart(mockBrownie, 'Chocolate', 'combo');

      expect(service.cartOriginalSubtotalPrice()).toBe(26000);
      expect(service.cartSubtotalPrice()).toBe(23400); // 10% OFF
      expect(service.cartTotalSavings()).toBe(2600);
      expect(service.cartTotalPrice()).toBe(23400 + 10000);
    });

    it('should apply discount on unit presentation as well on promotional days', () => {
      service.promotionService.setSimulatedDay(2);
      service.addToCart(mockBrownie, 'Chocolate', 'unit');

      expect(service.cartOriginalSubtotalPrice()).toBe(15000);
      expect(service.cartSubtotalPrice()).toBe(13500); // 10% OFF on $15.000
      expect(service.cartTotalSavings()).toBe(1500);
    });

    it('should include promotional discount details in WhatsApp message', () => {
      service.promotionService.setSimulatedDay(2); // Tuesday
      service.addToCart(mockBrownie, 'Chocolate', 'combo');

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

  describe('Minimum order validation (14.000 COP)', () => {
    const mockGummy = new Product({
      id: 'p1',
      name: 'Gomitas Lite',
      category: ProductCategory.Gomitas,
      price: 20000,
      unitPrice: 6000,
      weight: '4 unidades',
      description: 'Gomitas frutales suaves de efecto ligero',
    });

    it('should not meet minimum order when cart subtotal is less than 14000', () => {
      service.addToCart(mockGummy, undefined, 'unit'); // 1 unit = 6000
      expect(service.cartSubtotalPrice()).toBe(6000);
      expect(service.isMinimumOrderMet()).toBe(false);
      expect(service.amountForMinimumOrder()).toBe(8000);

      // Even with 2 units (12000)
      service.updateQuantity('p1', 1, undefined, 'unit');
      expect(service.cartSubtotalPrice()).toBe(12000);
      expect(service.isMinimumOrderMet()).toBe(false);
      expect(service.amountForMinimumOrder()).toBe(2000);
    });

    it('should meet minimum order when cart subtotal is 14000 or more', () => {
      service.addToCart(mockGummy, undefined, 'unit'); // 6000
      service.updateQuantity('p1', 2, undefined, 'unit'); // 3 units = 18000
      expect(service.cartSubtotalPrice()).toBe(18000);
      expect(service.isMinimumOrderMet()).toBe(true);
      expect(service.amountForMinimumOrder()).toBe(0);
    });

    it('should not include order details in WhatsApp URL when minimum order is not met', () => {
      service.addToCart(mockGummy, undefined, 'unit'); // 6000 < 14000
      const url = service.getWhatsAppUrl({
        whatsapp: '+57 314 4882666',
        phone: '',
        location: '',
        email: '',
        schedule: '',
        instagram: '',
      });
      expect(url).toBe('https://wa.me/573144882666');
      expect(url).not.toContain('Gomitas%20Lite');
    });
  });

  describe('Customer Delivery Details in WhatsApp URL', () => {
    it('should include customer name, phone, and address in WhatsApp message when provided', () => {
      service.addToCart(mockBrownie, 'Arequipe', 'unit'); // 15.000 >= 14.000
      const url = service.getWhatsAppUrl(
        {
          whatsapp: '+57 314 4882666',
          phone: '',
          location: '',
          email: '',
          schedule: '',
          instagram: '',
        },
        {
          name: 'Nicolas Castro',
          phone: '314 488 2666',
          address: 'Calle 123 #45-67, Apto 201',
        }
      );

      const decodedUrl = decodeURIComponent(url);
      expect(decodedUrl).toContain('Datos para la entrega:');
      expect(decodedUrl).toContain('Nicolas Castro');
      expect(decodedUrl).toContain('314 488 2666');
      expect(decodedUrl).toContain('Calle 123 #45-67, Apto 201');
    });
  });
});

