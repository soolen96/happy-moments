import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly SESSION_KEY = 'happy_moments_admin_auth';

  // Default credentials
  private readonly DEFAULT_USER = 'admin';
  private readonly DEFAULT_PASS = 'happymoments2026***';

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

  login(username: string, pass: string): boolean {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanUser === this.DEFAULT_USER && cleanPass === this.DEFAULT_PASS) {
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
