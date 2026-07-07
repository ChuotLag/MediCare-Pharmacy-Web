import { Injectable } from '@angular/core';
import { UserDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'medicare_access_token';
  private readonly userKey = 'medicare_user';

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user: UserDto): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): UserDto | null {
    const userJson = localStorage.getItem(this.userKey);

    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as UserDto;
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isCustomer(): boolean {
    return this.getRole() === 'Customer';
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}