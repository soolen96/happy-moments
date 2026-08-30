import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, ContactInfo, Combo } from '../../models';
import { HeaderComponent } from '../header/header';
import { ProductCarouselComponent } from '../product-carousel/product-carousel';
import { ProductCatalogComponent } from '../product-catalog/product-catalog';
import { CombosComponent } from '../combos/combos';
import { DeliveryInfoComponent } from '../delivery-info/delivery-info';
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
    ProductCategory.Combos,
  ];

  // All Artisanal Products (Synced via ProductService)
  products = this.productService.products;

  // Special Combos (Loaded dynamically from configuration.json)
  combos = signal<Combo[]>([]);

  footerText = signal<string>('');
  footerDescription = signal<string>('');

  // Popular products carousel filter
  popularProducts = computed(() => this.products().filter((p) => p.isPopular));

  // Combined list of products and converted combos for catalog search & filter
  allCatalogProducts = computed(() => {
    const regularProducts = this.products();
    const comboProducts = this.combos().map(
      (c) =>
        new Product({
          id: c.id,
          name: c.name,
          category: ProductCategory.Combos,
          price: c.price,
          description: c.description,
          badge: c.badge || 'Combo',
          image: c.image,
          weight: c.itemsCount || '',
          isPopular: true,
        })
    );
    return [...regularProducts, ...comboProducts];
  });

  // Catalog filtered products
  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.allCatalogProducts().filter((p) => {
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

  addToCart(event: { product: any; flavor?: string }): void {
    this.cartService.addToCart(event.product, event.flavor);
  }
}
