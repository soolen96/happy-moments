import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductDiscountInfo, ProductPresentation } from '../../models';
import { CartService } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';
import { SearchBoxComponent } from '../search-box/search-box';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, SearchBoxComponent],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.css',
})
export class ProductCatalogComponent {
  cartService = inject(CartService);
  promotionService = inject(PromotionService);

  products = input<Product[]>([]);
  categories = input<string[]>([]);
  selectedCategory = input<string>('Todos');
  searchQuery = input<string>('');

  searchQueryChange = output<string>();
  categoryChange = output<string>();

  // Flavor selection state per product
  selectedFlavors = signal<Record<string, string>>({});

  // Presentation selection state per product ('unit' | 'combo')
  selectedPresentations = signal<Record<string, ProductPresentation>>({});

  getSelectedFlavor(product: Product): string {
    return (
      this.selectedFlavors()[product.id] ||
      (product.flavors && product.flavors.length > 0 ? product.flavors[0] : '')
    );
  }

  selectFlavor(productId: string, flavor: string): void {
    this.selectedFlavors.update((map) => ({ ...map, [productId]: flavor }));
  }

  getSelectedPresentation(product: Product): ProductPresentation {
    if (!product.unitPrice) {
      return 'combo';
    }
    return this.selectedPresentations()[product.id] || 'combo';
  }

  selectPresentation(productId: string, presentation: ProductPresentation): void {
    this.selectedPresentations.update((map) => ({ ...map, [productId]: presentation }));
  }

  getUnitTitle(product: Product): string {
    if (product.unitTitle) return product.unitTitle;
    if (product.name.toLowerCase().includes('arequipe')) return 'Personal';
    return 'Por Unidad';
  }

  getUnitMeta(product: Product): string {
    if (product.unitMeta) return product.unitMeta;
    if (product.name.toLowerCase().includes('arequipe')) return '(20g - 1 porción)';
    return '(1 ud)';
  }

  getComboTitle(product: Product): string {
    if (product.comboTitle) return product.comboTitle;
    if (product.name.toLowerCase().includes('arequipe')) return 'Grande';
    return 'En Combo';
  }

  getComboMeta(product: Product): string {
    if (product.comboMeta) return product.comboMeta;
    if (product.name.toLowerCase().includes('arequipe')) return '(140g - 10 porciones)';
    return `(${product.weight || 'Pack'})`;
  }

  getWeightTag(product: Product): string {
    if (this.getSelectedPresentation(product) === 'unit') {
      if (product.unitMeta) return product.unitMeta.replace(/[()]/g, '');
      if (product.name.toLowerCase().includes('arequipe')) return '20g - 1 porción';
      return '1 unidad';
    }
    return product.weight || 'Combo';
  }

  getCurrentPrice(product: Product): number {
    if (this.getSelectedPresentation(product) === 'unit' && product.unitPrice !== undefined) {
      return product.unitPrice;
    }
    return product.price;
  }

  addToCart(product: Product): void {
    const flavor =
      product.flavors && product.flavors.length > 0
        ? this.getSelectedFlavor(product)
        : undefined;
    const presentation = this.getSelectedPresentation(product);
    this.cartService.addToCart(product, flavor, presentation);
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }

  getDiscountInfo(product: Product): ProductDiscountInfo {
    return this.promotionService.getDiscountForProduct(product, this.getCurrentPrice(product));
  }
}
