import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, ContactInfo, ProductDiscountInfo } from '../models';
import { CartStorageService } from './cart-storage.service';
import { PromotionService } from './promotion.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartStorage = inject(CartStorageService);
  promotionService = inject(PromotionService);

  cart = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  readonly DELIVERY_FEE = 10000;
  readonly FREE_GUMMY_THRESHOLD = 20000;

  cartTotalCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  cartOriginalSubtotalPrice = computed(() =>
    this.cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
  cartSubtotalPrice = computed(() =>
    this.cart().reduce(
      (sum, item) => sum + this.promotionService.getEffectivePrice(item.product) * item.quantity,
      0
    )
  );
  cartTotalSavings = computed(() =>
    Math.max(0, this.cartOriginalSubtotalPrice() - this.cartSubtotalPrice())
  );
  cartDeliveryFee = computed(() => (this.cart().length > 0 ? this.DELIVERY_FEE : 0));
  cartTotalPrice = computed(() => this.cartSubtotalPrice() + this.cartDeliveryFee());
  hasFreeGummyReward = computed(() => this.cartSubtotalPrice() >= this.FREE_GUMMY_THRESHOLD);
  amountForFreeGummy = computed(() => Math.max(0, this.FREE_GUMMY_THRESHOLD - this.cartSubtotalPrice()));

  constructor() {
    const savedCart = this.cartStorage.getCart();
    this.cart.set(savedCart);
  }

  addToCart(product: Product, selectedFlavor?: string): void {
    const flavor = selectedFlavor || (product.flavors && product.flavors.length > 0 ? product.flavors[0] : undefined);

    this.cart.update((currentItems) => {
      const existing = currentItems.find(
        (item) => item.product.id === product.id && item.selectedFlavor === flavor
      );
      let updated: CartItem[];
      if (existing) {
        updated = currentItems.map((item) =>
          item.product.id === product.id && item.selectedFlavor === flavor
            ? new CartItem(item.product, item.quantity + 1, item.selectedFlavor)
            : item
        );
      } else {
        updated = [...currentItems, new CartItem(product, 1, flavor)];
      }
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  removeFromCart(productId: string, selectedFlavor?: string): void {
    this.cart.update((items) => {
      const updated = items.filter(
        (i) => !(i.product.id === productId && (selectedFlavor === undefined || i.selectedFlavor === selectedFlavor))
      );
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  updateQuantity(productId: string, change: number, selectedFlavor?: string): void {
    this.cart.update((items) => {
      const updated = items.map((item) => {
        if (item.product.id === productId && (selectedFlavor === undefined || item.selectedFlavor === selectedFlavor)) {
          const newQty = item.quantity + change;
          return newQty > 0 ? new CartItem(item.product, newQty, item.selectedFlavor) : item;
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

  getItemDiscountInfo(product: Product): ProductDiscountInfo {
    return this.promotionService.getDiscountForProduct(product);
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
      const flavorTag = item.selectedFlavor ? ` (Sabor: ${item.selectedFlavor})` : '';
      const discount = this.promotionService.getDiscountForProduct(item.product);
      if (discount.hasDiscount) {
        const itemTotal = discount.discountedPrice * item.quantity;
        const origTotal = discount.originalPrice * item.quantity;
        message += `• ${item.product.name}${flavorTag} x${item.quantity} - ${this.formatCOP(itemTotal)} (🔥 ${discount.discountPercentage}% OFF, antes: ${this.formatCOP(origTotal)})\n`;
      } else {
        message += `• ${item.product.name}${flavorTag} x${item.quantity} - ${this.formatCOP(item.product.price * item.quantity)}\n`;
      }
    });

    if (this.cartTotalSavings() > 0) {
      message += `\n*Subtotal regular:* ${this.formatCOP(this.cartOriginalSubtotalPrice())}`;
      message += `\n*Descuento especial aplicado:* -${this.formatCOP(this.cartTotalSavings())}`;
    }
    message += `\n*Subtotal productos:* ${this.formatCOP(this.cartSubtotalPrice())}`;
    message += `\n*Domicilio Bogotá:* ${this.formatCOP(this.cartDeliveryFee())}`;
    if (this.hasFreeGummyReward()) {
      message += `\n*Promoción:* 🎁 1 Gomita de cortesía incluida (compras ≥ $20.000)`;
    }
    message += `\n*Total a pagar:* ${this.formatCOP(this.cartTotalPrice())}`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
