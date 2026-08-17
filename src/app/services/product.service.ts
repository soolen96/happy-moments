import { Injectable, signal, inject } from '@angular/core';
import { Product, ProductCategory } from '../models';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private configService = inject(ConfigurationService);
  private readonly STORAGE_KEY = 'happy_moments_products_override';

  products = signal<Product[]>([]);
  isLoaded = signal<boolean>(false);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    // 1. Try loading from localStorage override first
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const localData = localStorage.getItem(this.STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.products.set(parsed.map((p: any) => new Product(p)));
            this.isLoaded.set(true);
            return;
          }
        } catch (e) {
          console.error('Error parsing local products override:', e);
        }
      }
    }

    // 2. Fallback to assets/configuration.json
    this.configService.getConfig().subscribe({
      next: (config) => {
        if (config?.products) {
          const loaded = config.products.map((p) => new Product(p));
          this.products.set(loaded);
          this.isLoaded.set(true);
        }
      },
      error: (err) => console.error('Error loading configuration.json:', err),
    });
  }

  saveProductsToStorage(items: Product[]): void {
    this.products.set(items);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving products override:', e);
      }
    }
  }

  addProduct(newProduct: Partial<Product>): Product {
    const id = 'p_' + Date.now();
    const product = new Product({
      id,
      name: newProduct.name || 'Nuevo Producto',
      category: newProduct.category || ProductCategory.Brownies,
      price: newProduct.price || 10000,
      description: newProduct.description || 'Descripción del producto artesanal.',
      badge: newProduct.badge || 'Nuevo 🌟',
      image: newProduct.image || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      isPopular: newProduct.isPopular ?? true,
      rating: newProduct.rating || 5.0,
      weight: newProduct.weight || '150g',
    });

    const current = this.products();
    const updated = [product, ...current];
    this.saveProductsToStorage(updated);
    return product;
  }

  updateProduct(id: string, updatedData: Partial<Product>): void {
    const current = this.products();
    const updated = current.map((p) => (p.id === id ? new Product({ ...p, ...updatedData }) : p));
    this.saveProductsToStorage(updated);
  }

  deleteProduct(id: string): void {
    const current = this.products();
    const updated = current.filter((p) => p.id !== id);
    this.saveProductsToStorage(updated);
  }

  exportJSON(footerConfig?: any): string {
    const data = {
      products: this.products(),
      footer: footerConfig || {
        "contact-info": {
          "location": "Bogotá, Colombia",
          "phone": "+57 314 4882666",
          "instagram": "@happymomentsbyfio",
          "email": "happymoments420@gmail.com",
          "whatsapp": "+57 314 4882666",
          "schedule": "Lunes a Domingo de 10:00 am a 8:00 pm"
        },
        "text": "© 2026 Happy Moments - Edibles Ancestrales. Todos los derechos reservados",
        "description": "Edibles Ancestrales & Comida Artesanal. Gomitas, brownies y galletas creados para elevar tus mejores momentos con sabor y bienestar natural."
      }
    };
    return JSON.stringify(data, null, 2);
  }

  resetToDefault(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.loadProducts();
  }
}
