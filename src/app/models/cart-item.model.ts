import { Product } from './product.model';

export class CartItem {
  product: Product;
  quantity: number;
  selectedFlavor?: string;

  constructor(product: Product, quantity: number = 1, selectedFlavor?: string) {
    this.product = product;
    this.quantity = quantity;
    this.selectedFlavor = selectedFlavor;
  }
}
