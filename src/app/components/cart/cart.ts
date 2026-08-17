import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ContactInfo } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent {
  cartService = inject(CartService);

  @Input() contactInfo: ContactInfo | null = null;
}
