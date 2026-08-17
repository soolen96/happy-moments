import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuration } from '../models';

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
