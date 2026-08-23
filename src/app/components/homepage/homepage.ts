import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, ContactInfo, Combo } from '../../models';
import { CartComponent } from '../cart/cart';
import { ProductCarouselComponent } from '../product-carousel/product-carousel';
import { SearchBoxComponent } from '../search-box/search-box';
import { CombosComponent } from '../combos/combos';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CartComponent,
    ProductCarouselComponent,
    SearchBoxComponent,
    CombosComponent,
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

  // Navigation menu state
  isMenuOpen = signal<boolean>(false);

  // Theme state (Light Mode by default)
  isDarkMode = signal<boolean>(false);

  // Filter & Search
  selectedCategory = signal<string>('Todos');
  searchQuery = signal<string>('');

  // Categories
  categories = ['Todos', ProductCategory.Brownies, ProductCategory.Gomitas, ProductCategory.Galletas, ProductCategory.Combos];

  // All Artisanal Products (Synced via ProductService)
  products = this.productService.products;

  // Special Combos (Loaded dynamically from configuration.json)
  combos = signal<Combo[]>([]);

  footerText = signal<string>('');
  footerDescription = signal<string>('');

  // Popular products carousel filter
  popularProducts = computed(() => this.products().filter(p => p.isPopular));

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

  // Cart summary calculations delegated to cartService
  cartTotalCount = computed(() => this.cartService.cartTotalCount());
  cartTotalPrice = computed(() => this.cartService.cartTotalPrice());

  ngOnInit() {
    this.initTheme();
    this.loadConfiguration();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('happy_moments_theme');
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
    } else {
      this.isDarkMode.set(false); // Light Mode by default
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode.update((v) => !v);
    this.applyTheme();
  }

  private applyTheme() {
    const isDark = this.isDarkMode();
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('happy_moments_theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('happy_moments_theme', 'light');
      }
    }
  }

  loadConfiguration() {
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
      error: (err) => console.error('Error loading configuration JSON:', err)
    });
  }

  // Flavor selection state per product
  selectedFlavors = signal<Record<string, string>>({});

  getSelectedFlavor(product: Product): string {
    return this.selectedFlavors()[product.id] || (product.flavors && product.flavors.length > 0 ? product.flavors[0] : '');
  }

  selectFlavor(productId: string, flavor: string): void {
    this.selectedFlavors.update((map) => ({ ...map, [productId]: flavor }));
  }

  // Navigation logic
  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  // Cart logic delegated to CartService
  addToCart(product: any) {
    const flavor = product.flavors && product.flavors.length > 0 ? this.getSelectedFlavor(product) : undefined;
    this.cartService.addToCart(product, flavor);
  }

  toggleCart() {
    this.cartService.toggleCart();
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }
}
