import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CategoryDto } from '../models/category.model';

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryUpdateRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {
  private readonly baseUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<CategoryDto[]>> {
    return this.http.get<ApiResponse<CategoryDto[]>>(this.baseUrl);
  }

  getById(id: string): Observable<ApiResponse<CategoryDto>> {
    return this.http.get<ApiResponse<CategoryDto>>(`${this.baseUrl}/${id}`);
  }

  create(request: CategoryCreateRequest): Observable<ApiResponse<CategoryDto>> {
    return this.http.post<ApiResponse<CategoryDto>>(this.baseUrl, request);
  }

  update(id: string, request: CategoryUpdateRequest): Observable<ApiResponse<CategoryDto>> {
    return this.http.put<ApiResponse<CategoryDto>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.baseUrl}/${id}/toggle-active`, {});
  }
}