import { Component, input, signal } from '@angular/core';
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
export class ProductCarouselComponent {
  readonly defaultSlides: CarouselInfoSlide[] = [
    {
      image: 'assets/info/entregas-nocturnas.webp',
      alt: 'Hacemos entregas todos los días en horas de la noche',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/descuentos-martes-jueves.webp',
      alt: 'Promociones Martes y Jueves - 10% de descuento',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/lineas-efectos-info.webp',
      alt: 'Guía de líneas Lite, Fusión y Power',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/arequipe-fusion.webp',
      alt: 'Nuevo Producto Arequipe Fusión',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/happy-greek-yogurt.webp',
      alt: 'Nuevo Producto Happy Greek Yogurt Griego',
      fit: 'contain',
      position: 'center',
    },
    {
      image: 'assets/info/happy-sundae-info.webp',
      alt: 'Sabores Happy Sundae',
      fit: 'contain',
      position: 'center',
    },
  ];

  slides = input<CarouselInfoSlide[]>(this.defaultSlides);

  readonly carouselIndex = signal<number>(0);

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
  }

  prevSlide(): void {
    this.advanceSlide(-1);
  }

  setSlide(index: number): void {
    const list = this.slides();
    if (index >= 0 && index < list.length) {
      this.carouselIndex.set(index);
    }
  }
}

