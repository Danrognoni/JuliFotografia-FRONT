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

  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return !!user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
  });

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
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
    return this.token();
  }
}
