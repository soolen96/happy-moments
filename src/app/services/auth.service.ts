import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly SESSION_KEY = 'happy_moments_admin_auth';

  // Credentials
  private readonly DEFAULT_USER = 'admin';
  // SHA-256 Hash of the password (never stored in plain text)
  private readonly PASS_HASH = '00d610e6b3b895f7c5199452109a86f540e01d8386476a23317068989a07d556';

  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkSession();
  }

  private checkSession(): void {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const session = sessionStorage.getItem(this.SESSION_KEY);
      if (session === 'true') {
        this.isAuthenticated.set(true);
      }
    }
  }

  private async hashPassword(pass: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(pass);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return '';
  }

  async login(username: string, pass: string): Promise<boolean> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanUser !== this.DEFAULT_USER) {
      return false;
    }

    const hashedInput = await this.hashPassword(cleanPass);
    if (hashedInput === this.PASS_HASH) {
      this.isAuthenticated.set(true);
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.SESSION_KEY, 'true');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }
}
