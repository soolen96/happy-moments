import { Product } from './product.model';

export type ProductPresentation = 'unit' | 'combo';

export class CartItem {
  product: Product;
  quantity: number;
  selectedFlavor?: string;
  selectedPresentation: ProductPresentation;

  constructor(
    product: Product,
    quantity: number = 1,
    selectedFlavor?: string,
    selectedPresentation: ProductPresentation = 'combo'
  ) {
    this.product = product;
    this.quantity = quantity;
    this.selectedFlavor = selectedFlavor;
    this.selectedPresentation = selectedPresentation;
  }
}

