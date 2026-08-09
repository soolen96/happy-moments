import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationService, ContactInfo } from '../../services/configuration.service';

export interface Product {
  id: string;
  name: string;
  category: 'Brownies' | 'Gomitas' | 'Galletas' | 'Combos';
  price: number;
  description: string;
  badge?: string;
  image: string;
  isPopular?: boolean;
  rating: number;
  weight?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit, OnDestroy {
  private configService = inject(ConfigurationService);

  // Configuration state
  contactInfo = signal<ContactInfo | null>(null);

  // Navigation menu state
  isMenuOpen = signal<boolean>(false);


  // Cart state
  cart = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  // Filter & Search
  selectedCategory = signal<string>('Todos');
  searchQuery = signal<string>('');

  // Carousel state
  carouselIndex = signal<number>(0);
  private carouselInterval: any;

  // Categories
  categories = ['Todos', 'Brownies', 'Gomitas', 'Galletas', 'Combos'];

  // All Artisanal Products
  products = signal<Product[]>([
    {
      id: 'p1',
      name: 'Brownie Fudge con Nuez y Caramelo',
      category: 'Brownies',
      price: 12500,
      description: 'Brownie artesanal melcochudo elaborado con cacao al 70%, nueces crocantes y un toque de caramelo salado.',
      badge: 'Más Vendido 👑',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 4.9,
      weight: '120g'
    },
    {
      id: 'p2',
      name: 'Gomitas Artesanales de Frutos Rojos',
      category: 'Gomitas',
      price: 8500,
      description: 'Gomitas 100% artesanales con pulpa natural de mora, fresa y arándanos, sin conservantes artificiales.',
      badge: 'Receta Secreta 🫐',
      image: 'https://images.unsplash.com/photo-1582058091505-f87aede55a60?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 4.8,
      weight: '150g'
    },
    {
      id: 'p3',
      name: 'Galletas de Chispas de Chocolate & Vainilla',
      category: 'Galletas',
      price: 9800,
      description: 'Galletas horneadas al momento, suaves por dentro y doradas por fuera, cargadas de trozos de chocolate real.',
      badge: 'Horneado Hoy 🍪',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 5.0,
      weight: '180g (6 uds)'
    },
    {
      id: 'p4',
      name: 'Brownie Rubio de Arequipe & Avellanas',
      category: 'Brownies',
      price: 13000,
      description: 'Blondie blanco artesanal relleno de arequipe tradicional colombiano y trozos de avellana tostada.',
      badge: 'Especial ✨',
      image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      rating: 4.7,
      weight: '125g'
    },
    {
      id: 'p5',
      name: 'Gomitas Ácidas de Maracuyá & Mango',
      category: 'Gomitas',
      price: 9000,
      description: 'Explosión cítrica y dulce elaborada con jugos de maracuyá y mango real espolvoreadas con azúcar ácida.',
      badge: 'Nuevo 🥭',
      image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 4.9,
      weight: '150g'
    },
    {
      id: 'p6',
      name: 'Galletas Red Velvet con Centro de Queso Crema',
      category: 'Galletas',
      price: 11000,
      description: 'Galletas estilo neoyorquino con masa suave sabor red velvet y delicioso relleno artesanal.',
      badge: 'Favorito ❤️',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      rating: 4.9,
      weight: '160g'
    },
    {
      id: 'p7',
      name: 'Caja Regalo "Momento Dulce" (Combo)',
      category: 'Combos',
      price: 32000,
      description: 'Incluye 2 Brownies Fudge, 1 Paquete de Gomitas de Frutos Rojos y 4 Galletas de Chispas. Ideal para regalar.',
      badge: 'Mejor Opción 🎁',
      image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=80',
      isPopular: true,
      rating: 5.0,
      weight: 'Caja Surtida'
    }
  ]);
  footerText = signal<string>('');

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

  // Cart summary calculations
  cartTotalCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  cartTotalPrice = computed(() => this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));

  ngOnInit() {
    this.startCarouselAutoPlay();
    this.loadConfiguration();
  }

  loadConfiguration() {
    this.configService.getConfig().subscribe({
      next: (config) => {
        if (config?.footer?.['contact-info']) {
          this.contactInfo.set(config.footer['contact-info']);
        }

        //this.footerText.set(config.footer['text']);

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

  // Cart logic
  addToCart(product: Product) {
    this.cart.update(currentItems => {
      const existing = currentItems.find(item => item.product.id === product.id);
      if (existing) {
        return currentItems.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...currentItems, { product, quantity: 1 }];
      }
    });
  }

  removeFromCart(productId: string) {
    this.cart.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, change: number) {
    this.cart.update(items =>
      items.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  }

  toggleCart() {
    this.isCartOpen.update(v => !v);
  }

  formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }
}
