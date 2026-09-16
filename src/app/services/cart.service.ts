import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, ContactInfo, ProductDiscountInfo, ProductPresentation } from '../models';
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

  getItemBasePrice(item: CartItem): number {
    if (item.selectedPresentation === 'unit' && item.product.unitPrice !== undefined) {
      return item.product.unitPrice;
    }
    return item.product.price;
  }

  getItemEffectivePrice(item: CartItem): number {
    const basePrice = this.getItemBasePrice(item);
    return this.promotionService.getEffectivePrice(item.product, basePrice);
  }

  cartTotalCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  cartOriginalSubtotalPrice = computed(() =>
    this.cart().reduce((sum, item) => sum + this.getItemBasePrice(item) * item.quantity, 0)
  );
  cartSubtotalPrice = computed(() =>
    this.cart().reduce((sum, item) => sum + this.getItemEffectivePrice(item) * item.quantity, 0)
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

  addToCart(
    product: Product,
    selectedFlavor?: string,
    selectedPresentation: ProductPresentation = 'combo'
  ): void {
    const flavor = selectedFlavor || (product.flavors && product.flavors.length > 0 ? product.flavors[0] : undefined);
    const presentation: ProductPresentation = product.unitPrice ? selectedPresentation : 'combo';

    this.cart.update((currentItems) => {
      const existing = currentItems.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedFlavor === flavor &&
          item.selectedPresentation === presentation
      );
      let updated: CartItem[];
      if (existing) {
        updated = currentItems.map((item) =>
          item.product.id === product.id &&
          item.selectedFlavor === flavor &&
          item.selectedPresentation === presentation
            ? new CartItem(item.product, item.quantity + 1, item.selectedFlavor, item.selectedPresentation)
            : item
        );
      } else {
        updated = [...currentItems, new CartItem(product, 1, flavor, presentation)];
      }
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  removeFromCart(
    productId: string,
    selectedFlavor?: string,
    selectedPresentation?: ProductPresentation
  ): void {
    this.cart.update((items) => {
      const updated = items.filter(
        (i) =>
          !(
            i.product.id === productId &&
            (selectedFlavor === undefined || i.selectedFlavor === selectedFlavor) &&
            (selectedPresentation === undefined || i.selectedPresentation === selectedPresentation)
          )
      );
      this.cartStorage.saveCart(updated);
      return updated;
    });
  }

  updateQuantity(
    productId: string,
    change: number,
    selectedFlavor?: string,
    selectedPresentation?: ProductPresentation
  ): void {
    this.cart.update((items) => {
      const updated = items.map((item) => {
        if (
          item.product.id === productId &&
          (selectedFlavor === undefined || item.selectedFlavor === selectedFlavor) &&
          (selectedPresentation === undefined || item.selectedPresentation === selectedPresentation)
        ) {
          const newQty = item.quantity + change;
          return newQty > 0
            ? new CartItem(item.product, newQty, item.selectedFlavor, item.selectedPresentation)
            : item;
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

  getItemDiscountInfo(itemOrProduct: CartItem | Product, presentation?: ProductPresentation): ProductDiscountInfo {
    if (itemOrProduct instanceof CartItem || 'selectedPresentation' in itemOrProduct) {
      const cartItem = itemOrProduct as CartItem;
      const basePrice = this.getItemBasePrice(cartItem);
      return this.promotionService.getDiscountForProduct(cartItem.product, basePrice);
    }
    const product = itemOrProduct as Product;
    const basePrice = presentation === 'unit' && product.unitPrice !== undefined ? product.unitPrice : product.price;
    return this.promotionService.getDiscountForProduct(product, basePrice);
  }

  getPresentationBadge(product: Product, presentation?: ProductPresentation): string {
    const isUnit = presentation === 'unit';
    if (product.name.toLowerCase().includes('arequipe')) {
      return isUnit ? '🍯 Personal (20g - 1 porción)' : '🍯 Grande (140g - 10 porciones)';
    }
    if (product.unitTitle || product.comboTitle) {
      return isUnit
        ? `🍬 ${product.unitTitle || 'Unidad'} ${product.unitMeta || ''}`.trim()
        : `🎁 ${product.comboTitle || 'Combo'} ${product.comboMeta || '(' + (product.weight || 'Pack') + ')'}`.trim();
    }
    return isUnit ? '🍬 1 Unidad' : `🎁 Combo (${product.weight || 'Pack'})`;
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
      const presTag = item.product.unitPrice
        ? item.product.name.toLowerCase().includes('arequipe')
          ? item.selectedPresentation === 'unit'
            ? ' [Personal (20g - 1 porción)]'
            : ' [Grande (140g - 10 porciones)]'
          : item.selectedPresentation === 'unit'
            ? ` [${item.product.unitTitle || 'Unidad'}]`
            : ` [${item.product.comboTitle || 'Combo'} (${item.product.weight || 'Pack'})]`
        : '';
      const basePrice = this.getItemBasePrice(item);
      const discount = this.promotionService.getDiscountForProduct(item.product, basePrice);
      if (discount.hasDiscount) {
        const itemTotal = discount.discountedPrice * item.quantity;
        const origTotal = discount.originalPrice * item.quantity;
        message += `• ${item.product.name}${presTag}${flavorTag} x${item.quantity} - ${this.formatCOP(itemTotal)} (🔥 ${discount.discountPercentage}% OFF, antes: ${this.formatCOP(origTotal)})\n`;
      } else {
        message += `• ${item.product.name}${presTag}${flavorTag} x${item.quantity} - ${this.formatCOP(basePrice * item.quantity)}\n`;
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
