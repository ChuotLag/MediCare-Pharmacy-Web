import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import {
  InventoryCreateRequest,
  InventoryDto,
  InventoryQueryRequest,
  InventoryUpdateRequest
} from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class AdminInventoryService {
  private readonly baseUrl = `${environment.apiUrl}/admin/inventory`;

  constructor(private http: HttpClient) {}

  getPaged(query: InventoryQueryRequest): Observable<ApiResponse<PagedResult<InventoryDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.productId) {
      params = params.set('productId', query.productId);
    }

    return this.http.get<ApiResponse<PagedResult<InventoryDto>>>(this.baseUrl, {
      params
    });
  }

  getById(id: string): Observable<ApiResponse<InventoryDto>> {
    return this.http.get<ApiResponse<InventoryDto>>(`${this.baseUrl}/${id}`);
  }

  getByProductId(productId: string): Observable<ApiResponse<InventoryDto[]>> {
    return this.http.get<ApiResponse<InventoryDto[]>>(`${this.baseUrl}/product/${productId}`);
  }

  create(request: InventoryCreateRequest): Observable<ApiResponse<InventoryDto>> {
    return this.http.post<ApiResponse<InventoryDto>>(this.baseUrl, request);
  }

  update(id: string, request: InventoryUpdateRequest): Observable<ApiResponse<InventoryDto>> {
    return this.http.put<ApiResponse<InventoryDto>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  getLowStock(): Observable<ApiResponse<InventoryDto[]>> {
    return this.http.get<ApiResponse<InventoryDto[]>>(`${this.baseUrl}/low-stock`);
  }

  getNearExpiry(days = 60): Observable<ApiResponse<InventoryDto[]>> {
    const params = new HttpParams().set('days', days);

    return this.http.get<ApiResponse<InventoryDto[]>>(
      `${this.baseUrl}/near-expiry`,
      { params }
    );
  }
}