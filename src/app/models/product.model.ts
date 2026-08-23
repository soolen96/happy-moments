import { ProductCategory } from './product-category.enum';

export class Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  badge?: string;
  image: string;
  isPopular?: boolean;
  rating?: number;
  weight?: string;

  constructor(init?: Partial<Product>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.category = init?.category ?? ProductCategory.Brownies;
    this.price = init?.price ?? 0;
    this.description = init?.description ?? '';
    this.badge = init?.badge;
    this.image = init?.image ?? '';
    this.isPopular = init?.isPopular;
    this.rating = init?.rating ?? 5.0;
    this.weight = init?.weight;
  }
}
