import { ContactInfo } from './contact-info.model';
import { Product } from './product.model';
import { Combo } from './combo.model';
import { DiscountPromotion } from './discount-promotion.model';

export class Configuration {
  products?: Product[];
  combos?: Combo[];
  promotions?: DiscountPromotion[];
  footer: {
    text: string;
    description: string;
    'contact-info': ContactInfo;
  };

  constructor(init?: Partial<Configuration>) {
    this.products = init?.products?.map(p => new Product(p)) ?? [];
    this.combos = init?.combos?.map(c => new Combo(c)) ?? [];
    this.promotions = init?.promotions?.map(p => new DiscountPromotion(p)) ?? [];
    this.footer = {
      text: init?.footer?.text ?? '',
      description: init?.footer?.description ?? '',
      'contact-info': init?.footer?.['contact-info'] ?? new ContactInfo()
    };
  }
}
