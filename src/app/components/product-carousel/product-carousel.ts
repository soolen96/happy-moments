import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.css',
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  cartService = inject(CartService);

  @Input() popularProducts: Product[] = [];

  carouselIndex = 0;
  private carouselInterval: any;

  ngOnInit() {
    this.startCarouselAutoPlay();
  }

  ngOnDestroy() {
    this.stopCarouselAutoPlay();
  }

  startCarouselAutoPlay() {
    this.stopCarouselAutoPlay();
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarouselAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide() {
    const count = this.popularProducts.length;
    if (count > 0) {
      this.carouselIndex = (this.carouselIndex + 1) % count;
    }
  }

  prevSlide() {
    const count = this.popularProducts.length;
    if (count > 0) {
      this.carouselIndex = (this.carouselIndex - 1 + count) % count;
    }
  }

  setSlide(index: number) {
    this.carouselIndex = index;
    this.startCarouselAutoPlay();
  }

  selectedFlavors: Record<string, string> = {};

  getSelectedFlavor(product: Product): string {
    return this.selectedFlavors[product.id] || (product.flavors && product.flavors.length > 0 ? product.flavors[0] : '');
  }

  selectFlavor(productId: string, flavor: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedFlavors[productId] = flavor;
  }

  addToCart(product: Product) {
    const flavor = product.flavors && product.flavors.length > 0 ? this.getSelectedFlavor(product) : undefined;
    this.cartService.addToCart(product, flavor);
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }
}
