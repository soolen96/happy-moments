export class ContactInfo {
  location: string;
  phone: string;
  instagram: string;
  email: string;
  whatsapp: string;
  schedule: string;

  constructor(init?: Partial<ContactInfo>) {
    this.location = init?.location ?? '';
    this.phone = init?.phone ?? '';
    this.instagram = init?.instagram ?? '';
    this.email = init?.email ?? '';
    this.whatsapp = init?.whatsapp ?? '';
    this.schedule = init?.schedule ?? '';
  }
}
