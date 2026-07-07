import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AddToCartRequest, CartDto } from '../models/cart.model';

export interface UpdateCartItemRequest {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/Cart`;

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiResponse<CartDto>> {
    return this.http.get<ApiResponse<CartDto>>(this.baseUrl);
  }

  addToCart(request: AddToCartRequest): Observable<ApiResponse<CartDto>> {
    return this.http.post<ApiResponse<CartDto>>(`${this.baseUrl}/items`, request);
  }

  updateCartItem(cartItemId: string, request: UpdateCartItemRequest): Observable<ApiResponse<CartDto>> {
    return this.http.put<ApiResponse<CartDto>>(`${this.baseUrl}/items/${cartItemId}`, request);
  }

  removeCartItem(cartItemId: string): Observable<ApiResponse<CartDto>> {
    return this.http.delete<ApiResponse<CartDto>>(`${this.baseUrl}/items/${cartItemId}`);
  }

  clearCart(): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/clear`);
  }
}