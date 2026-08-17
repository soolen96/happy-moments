export class Combo {
  id: string;
  name: string;
  price: number;
  description: string;
  badge?: string;
  image: string;
  rating?: number;
  itemsCount?: string;

  constructor(init?: Partial<Combo>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.price = init?.price ?? 0;
    this.description = init?.description ?? '';
    this.badge = init?.badge ?? 'Combo 🎁';
    this.image = init?.image ?? 'assets/products/combo-box.png';
    this.rating = init?.rating ?? 5.0;
    this.itemsCount = init?.itemsCount ?? '';
  }
}
