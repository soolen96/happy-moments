import { Component, OnInit, OnDestroy, input } from '@angular/core';
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
      image: 'assets/info/entregas-nocturnas.jpg',
      alt: 'Entregas todos los días en horas de la noche',
      fit: 'cover',
      position: 'top left',
    },
    {
      image: 'assets/info/happy-greek-yogurt.jpg',
      alt: 'Nuevo Producto Happy Greek Yogurt Griego',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/arequipe-fusion.jpg',
      alt: 'Nuevo Producto Arequipe Fusión',
      fit: 'cover',
      position: 'center',
    },
    {
      image: 'assets/info/happy-sundae-info.jpg',
      alt: 'Sabores Happy Sundae',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/lineas-efectos-info.png',
      alt: 'Guía de líneas Lite, Fusión y Power',
      fit: 'contain',
      position: 'center',
    },
  ];

  slides = input<CarouselInfoSlide[]>(this.defaultSlides);

  carouselIndex = 0;
  private carouselInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startCarouselAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopCarouselAutoPlay();
  }

  startCarouselAutoPlay(): void {
    this.stopCarouselAutoPlay();
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarouselAutoPlay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  nextSlide(): void {
    const list = this.slides();
    if (list.length > 0) {
      this.carouselIndex = (this.carouselIndex + 1) % list.length;
    }
  }

  prevSlide(): void {
    const list = this.slides();
    if (list.length > 0) {
      this.carouselIndex = (this.carouselIndex - 1 + list.length) % list.length;
    }
  }

  setSlide(index: number): void {
    this.carouselIndex = index;
    this.startCarouselAutoPlay();
  }
}
