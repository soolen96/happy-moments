import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService } from '../../services/configuration.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductCategory, ContactInfo } from '../../models';
import { CartComponent } from '../cart/cart';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, CartComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit, OnDestroy {
  private configService = inject(ConfigurationService);
  cartService = inject(CartService);

  // Configuration state
  contactInfo = signal<ContactInfo | null>(null);

  // Navigation menu state
  isMenuOpen = signal<boolean>(false);

  // Theme state (Light Mode by default)
  isDarkMode = signal<boolean>(false);

  // Filter & Search
  selectedCategory = signal<string>('Todos');
  searchQuery = signal<string>('');

  // Carousel state
  carouselIndex = signal<number>(0);
  private carouselInterval: any;

  // Categories
  categories = ['Todos', ProductCategory.Brownies, ProductCategory.Gomitas, ProductCategory.Galletas, ProductCategory.Combos];

  // All Artisanal Products (Loaded dynamically from configuration.json)
  products = signal<Product[]>([]);

  footerText = signal<string>('');
  footerDescription = signal<string>('');

  // Popular products carousel filter
  popularProducts = computed(() => this.products().filter(p => p.isPopular));

  // Catalog filtered products
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

  // Cart summary calculations delegated to cartService
  cartTotalCount = computed(() => this.cartService.cartTotalCount());
  cartTotalPrice = computed(() => this.cartService.cartTotalPrice());

  ngOnInit() {
    this.initTheme();
    this.startCarouselAutoPlay();
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
        if (config?.products) {
          this.products.set(config.products.map(p => new Product(p)));
        }

        if (config?.footer?.['contact-info']) {
          this.contactInfo.set(config.footer['contact-info']);
        }

        this.footerText.set(config.footer.text);
        this.footerDescription.set(config.footer.description);
      },
      error: (err) => console.error('Error loading configuration JSON:', err)
    });
  }

  ngOnDestroy() {
    this.stopCarouselAutoPlay();
  }

  // Carousel logic
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
    const count = this.popularProducts().length;
    if (count > 0) {
      this.carouselIndex.set((this.carouselIndex() + 1) % count);
    }
  }

  prevSlide() {
    const count = this.popularProducts().length;
    if (count > 0) {
      this.carouselIndex.set((this.carouselIndex() - 1 + count) % count);
    }
  }

  setSlide(index: number) {
    this.carouselIndex.set(index);
    this.startCarouselAutoPlay();
  }

  // Navigation logic
  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  // Cart logic delegated to CartService
  addToCart(product: Product) {
    this.cartService.addToCart(product);
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
