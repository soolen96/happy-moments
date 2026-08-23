export class Combo {
  id: string;
  name: string;
  price: number;
  description: string;
  badge?: string;
  image: string;
  itemsCount?: string;

  constructor(init?: Partial<Combo>) {
    this.id = init?.id ?? '';
    this.name = init?.name ?? '';
    this.price = init?.price ?? 0;
    this.description = init?.description ?? '';
    this.badge = init?.badge ?? 'Combo 🎁';
    this.image = init?.image ?? 'assets/products/combo-box.png';
    this.itemsCount = init?.itemsCount ?? '';
  }
}
