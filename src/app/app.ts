import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('happy-moments');
  productService = inject(ProductService);

  isLoading = signal<boolean>(true);
  isFadingOut = signal<boolean>(false);

  ngOnInit() {
    const startTime = Date.now();
    const minDisplayTime = 800;

    const checkLoaded = () => {
      if (this.productService.isLoaded()) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
          this.isFadingOut.set(true);
          setTimeout(() => {
            this.isLoading.set(false);
          }, 500);
        }, remaining);
      } else {
        setTimeout(checkLoaded, 50);
      }
    };

    checkLoaded();
  }
}

