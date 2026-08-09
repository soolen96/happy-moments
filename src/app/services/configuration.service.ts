import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactInfo {
  location: string;
  phone: string;
  instagram: string;
  email: string;
  whatsapp: string;
  schedule: string;
  text: string;
}

export interface Configuration {
  footer: {
    'contact-info': ContactInfo;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private http = inject(HttpClient);
  private configUrl = 'assets/configuration.json';

  getConfig(): Observable<Configuration> {
    return this.http.get<Configuration>(this.configUrl);
  }
}
