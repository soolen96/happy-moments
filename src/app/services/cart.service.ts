import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, ContactInfo } from '../models';
import { CartStorageService } from './cart-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartStorage = inject(CartStorageService);

  cart = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  cartTotalCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  cartTotalPrice = computed(() => this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));

  constructor() {
    const savedCart = this.cartStorage.getCart();
    this.cart.set(savedCart);
  }

  addToCart(product: Product): void {
    this.cart.update((currentItems) => {
      const existing = currentItems.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = currentItems.map((item) =>
          item.product.id === product.id ? new CartItem(item.product, item.quantity + 1) : item
        );
      } else {
        updated = [...currentItems, new CartItem(product, 1)];
      }
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update((items) => {
      const updated = items.filter((i) => i.product.id !== productId);
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  updateQuantity(productId: string, change: number): void {
    this.cart.update((items) => {
      const updated = items.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? new CartItem(item.product, newQty) : item;
        }
        return item;
      });
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  toggleCart(): void {
    this.isCartOpen.update((v) => !v);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getWhatsAppUrl(contactInfo?: ContactInfo | null): string {
    const rawPhone = contactInfo?.whatsapp || '+573144882666';
    const cleanPhone = rawPhone.replace(/\+/g, '').replace(/\s+/g, '');

    const items = this.cart();
    if (items.length === 0) {
      return `https://wa.me/${cleanPhone}`;
    }

    let message = '¡Hola! Quisiera realizar el siguiente pedido en Happy Moments:\n\n';
    items.forEach((item) => {
      message += `• ${item.product.name} x${item.quantity} - ${this.formatCOP(item.product.price * item.quantity)}\n`;
    });
    message += `\n*Total:* ${this.formatCOP(this.cartTotalPrice())}`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
