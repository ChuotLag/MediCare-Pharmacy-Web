import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import { ProductDto, ProductQueryRequest } from '../models/product.model';

export interface ProductCreateRequest {
  categoryId: string;
  name: string;
  description?: string;
  ingredients?: string;
  usageInstructions?: string;
  contraindications?: string;
  manufacturer?: string;
  origin?: string;
  unit: string;
  price: number;
  imageUrl?: string;
  requiresPrescription: boolean;
}

export interface ProductUpdateRequest {
  categoryId: string;
  name: string;
  description?: string;
  ingredients?: string;
  usageInstructions?: string;
  contraindications?: string;
  manufacturer?: string;
  origin?: string;
  unit: string;
  price: number;
  imageUrl?: string;
  requiresPrescription: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private readonly baseUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  getPaged(query: ProductQueryRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(this.baseUrl, {
      params
    });
  }

  getById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`);
  }

  create(request: ProductCreateRequest): Observable<ApiResponse<ProductDto>> {
    return this.http.post<ApiResponse<ProductDto>>(this.baseUrl, request);
  }

  update(id: string, request: ProductUpdateRequest): Observable<ApiResponse<ProductDto>> {
    return this.http.put<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.baseUrl}/${id}/toggle-active`, {});
  }
}
