import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ProductCategory, ContactInfo, Combo } from '../../models';
import { HeaderComponent } from '../header/header';
import { ProductCarouselComponent } from '../product-carousel/product-carousel';
import { ProductCatalogComponent } from '../product-catalog/product-catalog';
import { CombosComponent } from '../combos/combos';
import { DeliveryInfoComponent } from '../delivery-info/delivery-info';
import { ProductInfoComponent } from '../product-info/product-info';
import { SpotifySectionComponent } from '../spotify-section/spotify-section';
import { CartComponent } from '../cart/cart';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ProductCarouselComponent,
    ProductCatalogComponent,
    CombosComponent,
    DeliveryInfoComponent,
    ProductInfoComponent,
    SpotifySectionComponent,
    CartComponent,
    FooterComponent,
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  private configService = inject(ConfigurationService);
  cartService = inject(CartService);
  productService = inject(ProductService);

  // Configuration state
  contactInfo = signal<ContactInfo | null>(null);

  // Theme state (Light Mode by default)
  isDarkMode = signal<boolean>(false);

  // Filter & Search
  selectedCategory = signal<string>('Todos');
  searchQuery = signal<string>('');

  // Categories
  categories = [
    'Todos',
    ProductCategory.Brownies,
    ProductCategory.Gomitas,
    ProductCategory.Galletas,
    ProductCategory.Chocolates,
    ProductCategory.Sundaes,
    ProductCategory.Otros,
  ];

  // All Artisanal Products (Synced via ProductService)
  products = this.productService.products;

  // Special Combos (Loaded dynamically from configuration.json)
  combos = signal<Combo[]>([]);

  footerText = signal<string>('');
  footerDescription = signal<string>('');

  // Catalog filtered products (excluding combos since combos have their own section)
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.products().filter((p) => {
      const matchesCategory = category === 'Todos' || p.category === category;
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });

  ngOnInit(): void {
    this.initTheme();
    this.loadConfiguration();
  }

  initTheme(): void {
    const savedTheme =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('happy_moments_theme')
        : null;
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    } else {
      this.isDarkMode.set(false); // Light Mode by default
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
    this.applyTheme();
  }

  private applyTheme(): void {
    const isDark = this.isDarkMode();
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('happy_moments_theme', isDark ? 'dark' : 'light');
    }
  }

  loadConfiguration(): void {
    this.configService.getConfig().subscribe({
      next: (config) => {
        if (config?.combos) {
          this.combos.set(config.combos.map((c) => new Combo(c)));
        }

        if (config?.footer?.['contact-info']) {
          this.contactInfo.set(config.footer['contact-info']);
        }

        this.footerText.set(config.footer?.text || '');
        this.footerDescription.set(config.footer?.description || '');
      },
      error: (err) => console.error('Error loading configuration JSON:', err),
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
