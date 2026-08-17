export class ContactInfo {
  location: string;
  phone: string;
  instagram: string;
  instagramUrl?: string;
  email: string;
  whatsapp: string;
  schedule: string;

  constructor(init?: Partial<ContactInfo>) {
    this.location = init?.location ?? '';
    this.phone = init?.phone ?? '';
    this.instagram = init?.instagram ?? '@happy.moments.bog';
    this.instagramUrl = init?.instagramUrl ?? 'https://www.instagram.com/happy.moments.bog';
    this.email = init?.email ?? '';
    this.whatsapp = init?.whatsapp ?? '';
    this.schedule = init?.schedule ?? '';
  }
}
