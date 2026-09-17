import { Component, OnInit, OnDestroy, HostListener, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CarouselInfoSlide {
  image: string;
  alt: string;
  fit?: 'cover' | 'contain';
  position?: string;
}

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.css',
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  readonly defaultSlides: CarouselInfoSlide[] = [
    {
      image: 'assets/info/entregas-nocturnas.webp',
      alt: 'Hacemos entregas todos los días en horas de la noche',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/descuentos-martes-jueves.webp',
      alt: 'Promociones Martes y Jueves - 10% de descuento',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/lineas-efectos-info.webp',
      alt: 'Guía de líneas Lite, Fusión y Power',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/arequipe-fusion.webp',
      alt: 'Nuevo Producto Arequipe Fusión',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/happy-greek-yogurt.webp',
      alt: 'Nuevo Producto Happy Greek Yogurt Griego',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/happy-sundae-info.webp',
      alt: 'Sabores Happy Sundae',
      fit: 'cover',
      position: 'center',
    },
  ];

  slides = input<CarouselInfoSlide[]>(this.defaultSlides);

  readonly carouselIndex = signal<number>(0);
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private isHovered = false;

  // Touch swipe support
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.startCarouselAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopCarouselAutoPlay();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.hidden) {
      this.stopCarouselAutoPlay();
    } else {
      this.startCarouselAutoPlay();
    }
  }

  startCarouselAutoPlay(): void {
    this.stopCarouselAutoPlay();
    if (this.isHovered || (typeof document !== 'undefined' && document.hidden)) {
      return;
    }
    this.carouselInterval = setInterval(() => {
      this.advanceSlide(1);
    }, 5000);
  }

  stopCarouselAutoPlay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  pauseCarousel(): void {
    this.isHovered = true;
    this.stopCarouselAutoPlay();
  }

  resumeCarousel(): void {
    this.isHovered = false;
    this.startCarouselAutoPlay();
  }

  private advanceSlide(step: number): void {
    const list = this.slides();
    if (list.length > 0) {
      this.carouselIndex.update((current) => {
        const next = (current + step) % list.length;
        return next < 0 ? next + list.length : next;
      });
    }
  }

  nextSlide(): void {
    this.advanceSlide(1);
    this.startCarouselAutoPlay();
  }

  prevSlide(): void {
    this.advanceSlide(-1);
    this.startCarouselAutoPlay();
  }

  setSlide(index: number): void {
    const list = this.slides();
    if (index >= 0 && index < list.length) {
      this.carouselIndex.set(index);
    }
    this.startCarouselAutoPlay();
  }

  onTouchStart(event: TouchEvent): void {
    this.pauseCarousel();
    if (event.changedTouches && event.changedTouches.length > 0) {
      this.touchStartX = event.changedTouches[0].screenX;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches && event.changedTouches.length > 0) {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    }
    this.resumeCarousel();
  }

  private handleSwipe(): void {
    const swipeThreshold = 45;
    const diff = this.touchEndX - this.touchStartX;
    if (diff > swipeThreshold) {
      this.prevSlide();
    } else if (diff < -swipeThreshold) {
      this.nextSlide();
    }
  }
}
