import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactInfo } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  cartService = inject(CartService);

  contactInfo = input<ContactInfo | null>(null);
  footerDescription = input<string>('');
  footerText = input<string>('');
  isDarkMode = input<boolean>(false);
}
