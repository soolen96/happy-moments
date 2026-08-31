import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info.html',
  styleUrl: './product-info.css',
})
export class ProductInfoComponent {
  image1 = input<string>('assets/info/happy-sundae-info.jpg');
  image2 = input<string>('assets/info/lineas-efectos-info.png');
}
