import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminCreateUserRequest,
  AdminUserQueryRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserDto
} from '../models/auth.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/Auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/register`,
      request
    );
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.data?.accessToken) {
            this.tokenService.setToken(response.data.accessToken);
            this.tokenService.setUser(response.data.user);
          }
        })
      );
  }

  me(): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/me`);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/forgot-password`,
      request
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.baseUrl}/reset-password`,
      request
    );
  }

  adminCreateUser(request: AdminCreateUserRequest): Observable<ApiResponse<UserDto>> {
    return this.http.post<ApiResponse<UserDto>>(
      `${this.baseUrl}/admin/create-user`,
      request
    );
  }

  logout(): void {
    this.tokenService.clear();
  }



  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<UserDto>> {
  return this.http.put<ApiResponse<UserDto>>(
    `${this.baseUrl}/profile`,
    request
  );
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${this.baseUrl}/change-password`,
      request
    );
  }
}

