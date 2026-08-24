import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { CartStorageService } from './cart-storage.service';
import { Product, ProductCategory } from '../models';

describe('CartService - Flavor Selection', () => {
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
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CartService, CartStorageService],
    });
    service = TestBed.inject(CartService);
    service.cart.set([]);
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
    expect(service.cartTotalPrice()).toBe(26000 * 3);
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
});
