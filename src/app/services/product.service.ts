import { Injectable, signal, inject } from '@angular/core';
import { Product, ProductCategory, Combo, ContactInfo } from '../models';
import { ConfigurationService } from './configuration.service';

export interface FooterConfig {
  'contact-info': ContactInfo;
  text: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private configService = inject(ConfigurationService);
  private readonly STORAGE_KEY = 'happy_moments_products_override';
  private readonly COMBOS_STORAGE_KEY = 'happy_moments_combos_override';
  private readonly FOOTER_STORAGE_KEY = 'happy_moments_footer_override';

  products = signal<Product[]>([]);
  combos = signal<Combo[]>([]);
  footer = signal<FooterConfig>({
    'contact-info': new ContactInfo(),
    text: '',
    description: '',
  });
  isLoaded = signal<boolean>(false);

  constructor() {
    this.loadConfigurationData();
  }

  loadConfigurationData(): void {
    let productsLoadedFromLocal = false;
    let combosLoadedFromLocal = false;
    let footerLoadedFromLocal = false;

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // 1. Try loading products from localStorage override
      const localProducts = localStorage.getItem(this.STORAGE_KEY);
      if (localProducts) {
        try {
          const parsed = JSON.parse(localProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.products.set(parsed.map((p: any) => new Product(p)));
            productsLoadedFromLocal = true;
          }
        } catch (e) {
          console.error('Error parsing local products override:', e);
        }
      }

      // 2. Try loading combos from localStorage override
      const localCombos = localStorage.getItem(this.COMBOS_STORAGE_KEY);
      if (localCombos) {
        try {
          const parsed = JSON.parse(localCombos);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.combos.set(parsed.map((c: any) => new Combo(c)));
            combosLoadedFromLocal = true;
          }
        } catch (e) {
          console.error('Error parsing local combos override:', e);
        }
      }

      // 3. Try loading footer from localStorage override
      const localFooter = localStorage.getItem(this.FOOTER_STORAGE_KEY);
      if (localFooter) {
        try {
          const parsed = JSON.parse(localFooter);
          if (parsed && parsed['contact-info']) {
            this.footer.set({
              'contact-info': new ContactInfo(parsed['contact-info']),
              text: parsed.text || '',
              description: parsed.description || '',
            });
            footerLoadedFromLocal = true;
          }
        } catch (e) {
          console.error('Error parsing local footer override:', e);
        }
      }
    }

    // Fallback to assets/configuration.json for any unpopulated data
    if (!productsLoadedFromLocal || !combosLoadedFromLocal || !footerLoadedFromLocal) {
      this.configService.getConfig().subscribe({
        next: (config) => {
          if (!productsLoadedFromLocal && config?.products) {
            this.products.set(config.products.map((p) => new Product(p)));
          }
          if (!combosLoadedFromLocal && config?.combos) {
            this.combos.set(config.combos.map((c) => new Combo(c)));
          }
          if (!footerLoadedFromLocal && config?.footer) {
            this.footer.set({
              'contact-info': new ContactInfo(config.footer['contact-info']),
              text: config.footer.text || '',
              description: config.footer.description || '',
            });
          }
          this.isLoaded.set(true);
        },
        error: (err) => console.error('Error loading configuration.json:', err),
      });
    } else {
      this.isLoaded.set(true);
    }
  }

  // --- PRODUCTS CRUD ---
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
      image: newProduct.image || 'assets/products/chocolates-mix.png',
      isPopular: newProduct.isPopular ?? true,
      weight: newProduct.weight || '150g',
      flavors: newProduct.flavors,
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

  // --- COMBOS CRUD ---
  saveCombosToStorage(items: Combo[]): void {
    this.combos.set(items);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.COMBOS_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error saving combos override:', e);
      }
    }
  }

  addCombo(newCombo: Partial<Combo>): Combo {
    const id = 'c_' + Date.now();
    const combo = new Combo({
      id,
      name: newCombo.name || 'Nuevo Combo Especial',
      price: newCombo.price || 30000,
      description: newCombo.description || 'Descripción de los productos incluidos en el combo.',
      badge: newCombo.badge || 'Combo 🎁',
      image: newCombo.image || 'assets/combos/combo-personal.png',
      itemsCount: newCombo.itemsCount || '3 productos',
    });

    const current = this.combos();
    const updated = [combo, ...current];
    this.saveCombosToStorage(updated);
    return combo;
  }

  updateCombo(id: string, updatedData: Partial<Combo>): void {
    const current = this.combos();
    const updated = current.map((c) => (c.id === id ? new Combo({ ...c, ...updatedData }) : c));
    this.saveCombosToStorage(updated);
  }

  deleteCombo(id: string): void {
    const current = this.combos();
    const updated = current.filter((c) => c.id !== id);
    this.saveCombosToStorage(updated);
  }

  // --- FOOTER CONFIGURATION ---
  saveFooterToStorage(footerData: FooterConfig): void {
    this.footer.set(footerData);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.FOOTER_STORAGE_KEY, JSON.stringify(footerData));
      } catch (e) {
        console.error('Error saving footer override:', e);
      }
    }
  }

  updateFooter(text: string, description: string): void {
    const current = this.footer();
    const updated: FooterConfig = {
      ...current,
      text,
      description,
    };
    this.saveFooterToStorage(updated);
  }

  updateContactInfo(info: Partial<ContactInfo>): void {
    const current = this.footer();
    const updated: FooterConfig = {
      ...current,
      'contact-info': new ContactInfo({
        ...current['contact-info'],
        ...info,
      }),
    };
    this.saveFooterToStorage(updated);
  }

  // --- EXPORT & RESET ---
  exportJSON(): string {
    const data = {
      products: this.products(),
      combos: this.combos(),
      footer: this.footer(),
    };
    return JSON.stringify(data, null, 2);
  }

  resetToDefault(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.COMBOS_STORAGE_KEY);
      localStorage.removeItem(this.FOOTER_STORAGE_KEY);
    }
    this.loadConfigurationData();
  }
}
