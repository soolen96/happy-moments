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

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }
}
