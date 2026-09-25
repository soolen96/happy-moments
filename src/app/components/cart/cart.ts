import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ContactInfo } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent {
  cartService = inject(CartService);

  @Input() contactInfo: ContactInfo | null = null;

  private readonly STORAGE_KEY = 'happy_moments_customer_info';

  isCustomerModalOpen = signal<boolean>(false);

  customerName = signal<string>('');
  customerPhone = signal<string>('');
  customerAddress = signal<string>('');

  nameTouched = signal<boolean>(false);
  phoneTouched = signal<boolean>(false);
  addressTouched = signal<boolean>(false);

  constructor() {
    this.loadCustomerInfo();
  }

  openCustomerModal(): void {
    if (this.cartService.isMinimumOrderMet()) {
      this.isCustomerModalOpen.set(true);
    }
  }

  closeCustomerModal(): void {
    this.isCustomerModalOpen.set(false);
  }

  onCompleteOrder(): void {
    this.closeCustomerModal();
  }

  private loadCustomerInfo(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) this.customerName.set(parsed.name);
          if (parsed.phone) this.customerPhone.set(parsed.phone);
          if (parsed.address) this.customerAddress.set(parsed.address);
        }
      } catch (e) {
        console.warn('Error reading customer info from localStorage', e);
      }
    }
  }

  private saveCustomerInfo(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify({
            name: this.customerName(),
            phone: this.customerPhone(),
            address: this.customerAddress(),
          })
        );
      } catch (e) {
        console.warn('Error saving customer info to localStorage', e);
      }
    }
  }

  onNameChange(value: string): void {
    this.customerName.set(value);
    this.saveCustomerInfo();
  }

  onPhoneChange(value: string): void {
    this.customerPhone.set(value);
    this.saveCustomerInfo();
  }

  onAddressChange(value: string): void {
    this.customerAddress.set(value);
    this.saveCustomerInfo();
  }

  onBlur(field: 'name' | 'phone' | 'address'): void {
    if (field === 'name') this.nameTouched.set(true);
    if (field === 'phone') this.phoneTouched.set(true);
    if (field === 'address') this.addressTouched.set(true);
  }

  isNameValid(): boolean {
    return this.customerName().trim().length >= 2;
  }

  isPhoneValid(): boolean {
    const digitsOnly = this.customerPhone().replace(/\D/g, '');
    return digitsOnly.length >= 7;
  }

  isAddressValid(): boolean {
    return this.customerAddress().trim().length >= 5;
  }

  isFormValid(): boolean {
    return this.isNameValid() && this.isPhoneValid() && this.isAddressValid();
  }

  canCheckout(): boolean {
    return this.cartService.isMinimumOrderMet() && this.isFormValid();
  }

  getDisabledTooltip(): string {
    if (!this.isFormValid()) {
      return 'Completa tu nombre, celular y dirección para habilitar el pedido por WhatsApp';
    }
    return 'Enviar pedido a Whatsapp';
  }

  focusFirstInvalidField(): void {
    this.nameTouched.set(true);
    this.phoneTouched.set(true);
    this.addressTouched.set(true);

    if (typeof document === 'undefined') return;

    if (!this.isNameValid()) {
      const el = document.getElementById('customer-name');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    } else if (!this.isPhoneValid()) {
      const el = document.getElementById('customer-phone');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    } else if (!this.isAddressValid()) {
      const el = document.getElementById('customer-address');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }
  }

  getWhatsAppCheckoutUrl(): string {
    return this.cartService.getWhatsAppUrl(this.contactInfo, {
      name: this.customerName(),
      phone: this.customerPhone(),
      address: this.customerAddress(),
    });
  }
}
