import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import { ProductDto, ProductQueryRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/Products`;

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

  getBySlug(slug: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.baseUrl}/slug/${slug}`);
  }

  getById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`);
  }
}