import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'dennis_jwt_token';
  private readonly userKey = 'dennis_user_info';

  readonly token = signal<string | null>(this.getInitialToken());
  readonly currentUser = signal<AuthResponse | null>(this.getInitialUser());

  readonly isAuthenticated = computed(() => !!this.token() && !this.isTokenExpired(this.token()));
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    const token = this.token();
    return !!token && !this.isTokenExpired(token) && !!user &&
      user.email?.toLowerCase() === 'julietamarateo4@gmail.com' &&
      (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
  });

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && typeof payload.exp === 'number') {
        return Date.now() >= payload.exp * 1000;
      }
      return false;
    } catch {
      return true;
    }
  }

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.tokenKey);
      if (stored) {
        if (this.isTokenExpired(stored)) {
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem(this.userKey);
          return null;
        }
        return stored;
      }
    }
    return null;
  }

  private getInitialUser(): AuthResponse | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.userKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          this.token.set(res.token);
          this.currentUser.set(res);
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.tokenKey, res.token);
            localStorage.setItem(this.userKey, JSON.stringify(res));
          }
        }
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  getToken(): string | null {
    const current = this.token();
    if (current && this.isTokenExpired(current)) {
      this.logout();
      return null;
    }
    return current;
  }
}
