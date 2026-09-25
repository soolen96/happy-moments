import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart';
import { CartService } from '../../services/cart.service';
import { Product, ProductCategory } from '../../models';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartService;

  const mockProduct = new Product({
    id: 'prod-1',
    name: 'Brownie Especial',
    category: ProductCategory.Brownies,
    price: 25000,
    unitPrice: 15000,
    weight: '1 unidad',
    description: 'Delicioso brownie con topping',
  });

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    await TestBed.configureTestingModule({
      imports: [CartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    cartService.cart.set([]);
    fixture.detectChanges();
  });

  it('should create CartComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initially have empty customer fields and canCheckout should be false', () => {
    expect(component.customerName()).toBe('');
    expect(component.customerPhone()).toBe('');
    expect(component.customerAddress()).toBe('');
    expect(component.isFormValid()).toBe(false);
    expect(component.canCheckout()).toBe(false);
  });

  it('should validate customer fields correctly', () => {
    component.onNameChange('N');
    expect(component.isNameValid()).toBe(false);

    component.onNameChange('Nicolas');
    expect(component.isNameValid()).toBe(true);

    component.onPhoneChange('123');
    expect(component.isPhoneValid()).toBe(false);

    component.onPhoneChange('314 488 2666');
    expect(component.isPhoneValid()).toBe(true);

    component.onAddressChange('Cra');
    expect(component.isAddressValid()).toBe(false);

    component.onAddressChange('Cra 15 # 85-30, Apto 402');
    expect(component.isAddressValid()).toBe(true);

    expect(component.isFormValid()).toBe(true);
  });

  it('should not allow checkout when minimum order is not met even if form is valid', () => {
    // Add small product below 14.000 minimum
    const smallProduct = new Product({
      id: 'small',
      name: 'Gomita Mini',
      price: 6000,
      unitPrice: 6000,
    });
    cartService.addToCart(smallProduct, undefined, 'unit');

    component.onNameChange('Nicolas');
    component.onPhoneChange('3144882666');
    component.onAddressChange('Calle 100 # 15-20');

    expect(component.isFormValid()).toBe(true);
    expect(cartService.isMinimumOrderMet()).toBe(false);
    expect(component.canCheckout()).toBe(false);
  });

  it('should allow checkout when minimum order is met AND customer form is valid', () => {
    // Add item that meets 14.000 minimum
    cartService.addToCart(mockProduct, 'Arequipe', 'unit'); // 15000 >= 14000
    expect(cartService.isMinimumOrderMet()).toBe(true);

    component.onNameChange('Nicolas Castro');
    component.onPhoneChange('314 488 2666');
    component.onAddressChange('Calle 123 #45-67, Apto 201');

    expect(component.isFormValid()).toBe(true);
    expect(component.canCheckout()).toBe(true);

    const url = decodeURIComponent(component.getWhatsAppCheckoutUrl());
    expect(url).toContain('Nicolas Castro');
    expect(url).toContain('314 488 2666');
    expect(url).toContain('Calle 123 #45-67, Apto 201');
    expect(url).toContain('Brownie Especial');
  });

  it('should save and load customer info from localStorage', () => {
    component.onNameChange('Andrea Rojas');
    component.onPhoneChange('320 123 4567');
    component.onAddressChange('Cra 7 # 72-10');

    const stored = JSON.parse(localStorage.getItem('happy_moments_customer_info') || '{}');
    expect(stored.name).toBe('Andrea Rojas');
    expect(stored.phone).toBe('320 123 4567');
    expect(stored.address).toBe('Cra 7 # 72-10');

    // Create a new component instance to verify loading from storage
    const newFixture = TestBed.createComponent(CartComponent);
    const newComponent = newFixture.componentInstance;
    expect(newComponent.customerName()).toBe('Andrea Rojas');
    expect(newComponent.customerPhone()).toBe('320 123 4567');
    expect(newComponent.customerAddress()).toBe('Cra 7 # 72-10');
  });

  it('should mark fields as touched when calling focusFirstInvalidField()', () => {
    expect(component.nameTouched()).toBe(false);
    expect(component.phoneTouched()).toBe(false);
    expect(component.addressTouched()).toBe(false);

    component.focusFirstInvalidField();

    expect(component.nameTouched()).toBe(true);
    expect(component.phoneTouched()).toBe(true);
    expect(component.addressTouched()).toBe(true);
  });

  describe('Customer Info Modal handling', () => {
    it('should not open modal when minimum order is not met', () => {
      expect(component.isCustomerModalOpen()).toBe(false);
      component.openCustomerModal();
      expect(component.isCustomerModalOpen()).toBe(false);
    });

    it('should open modal when minimum order is met', () => {
      cartService.addToCart(mockProduct, 'Arequipe', 'unit'); // 15.000 >= 14.000
      expect(component.isCustomerModalOpen()).toBe(false);
      component.openCustomerModal();
      expect(component.isCustomerModalOpen()).toBe(true);
    });

    it('should close modal when closeCustomerModal is called', () => {
      cartService.addToCart(mockProduct, 'Arequipe', 'unit');
      component.openCustomerModal();
      expect(component.isCustomerModalOpen()).toBe(true);
      component.closeCustomerModal();
      expect(component.isCustomerModalOpen()).toBe(false);
    });

    it('should close modal upon onCompleteOrder', () => {
      cartService.addToCart(mockProduct, 'Arequipe', 'unit');
      component.openCustomerModal();
      expect(component.isCustomerModalOpen()).toBe(true);
      component.onCompleteOrder();
      expect(component.isCustomerModalOpen()).toBe(false);
    });
  });
});
