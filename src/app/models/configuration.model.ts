import { ContactInfo } from './contact-info.model';
import { Product } from './product.model';

export class Configuration {
  products?: Product[];
  footer: {
    text: string;
    description: string;
    'contact-info': ContactInfo;
  };

  constructor(init?: Partial<Configuration>) {
    this.products = init?.products?.map(p => new Product(p)) ?? [];
    this.footer = {
      text: init?.footer?.text ?? '',
      description: init?.footer?.description ?? '',
      'contact-info': init?.footer?.['contact-info'] ?? new ContactInfo()
    };
  }
}
