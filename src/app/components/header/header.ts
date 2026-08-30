import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfo } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  cartService = inject(CartService);

  contactInfo = input<ContactInfo | null>(null);
  isDarkMode = input<boolean>(false);

  categorySelected = output<string>();
  themeToggled = output<void>();

  isMenuOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  selectCategory(category: string): void {
    this.closeMenu();
    this.categorySelected.emit(category);
  }

  toggleTheme(): void {
    this.themeToggled.emit();
  }

  toggleCart(): void {
    this.cartService.toggleCart();
  }
}
