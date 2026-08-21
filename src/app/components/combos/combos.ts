import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combo, Product, ProductCategory } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combos.html',
  styleUrl: './combos.css',
})
export class CombosComponent {
  cartService = inject(CartService);

  @Input() combos: Combo[] = [];

  addToCart(combo: Combo) {
    // Convert combo to Product format for Cart compatibility
    const comboProduct = new Product({
      id: combo.id,
      name: combo.name,
      category: ProductCategory.Combos,
      price: combo.price,
      description: combo.description,
      badge: combo.badge || 'Combo Especial',
      image: combo.image,
      weight: combo.itemsCount || 'Combo Pack',
      isPopular: true,
    });

    this.cartService.addToCart(comboProduct);
  }

  formatCOP(amount: number): string {
    return this.cartService.formatCOP(amount);
  }
}
