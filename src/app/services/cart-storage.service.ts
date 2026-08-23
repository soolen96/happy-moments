import { Injectable } from '@angular/core';
import { CartItem, Product } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartStorageService {
  private readonly STORAGE_KEY = 'happy_moments_cart';

  getCart(): CartItem[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => new CartItem(new Product(item.product), item.quantity, item.selectedFlavor));
    } catch (e) {
      console.error('Error reading cart from localStorage:', e);
      return [];
    }
  }

  saveCart(items: CartItem[]): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }
}
