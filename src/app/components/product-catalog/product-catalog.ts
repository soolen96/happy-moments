import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';
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

  products = input<Product[]>([]);
  categories = input<string[]>([]);
  selectedCategory = input<string>('Todos');
  searchQuery = input<string>('');

  searchQueryChange = output<string>();
  categoryChange = output<string>();

  // Flavor selection state per product
  selectedFlavors = signal<Record<string, string>>({});

  getSelectedFlavor(product: Product): string {
    return (
      this.selectedFlavors()[product.id] ||
      (product.flavors && product.flavors.length > 0 ? product.flavors[0] : '')
    );
  }

  selectFlavor(productId: string, flavor: string): void {
    this.selectedFlavors.update((map) => ({ ...map, [productId]: flavor }));
  }

  addToCart(product: Product): void {
    const flavor =
      product.flavors && product.flavors.length > 0
        ? this.getSelectedFlavor(product)
        : undefined;
    this.cartService.addToCart(product, flavor);
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }
}
