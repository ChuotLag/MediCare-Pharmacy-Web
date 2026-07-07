import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import {
  OrderDto,
  OrderQueryRequest,
  UpdateOrderStatusRequest
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private readonly baseUrl = `${environment.apiUrl}/admin/orders`;

  constructor(private http: HttpClient) {}

  getAllOrders(query: OrderQueryRequest): Observable<ApiResponse<PagedResult<OrderDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<ApiResponse<PagedResult<OrderDto>>>(this.baseUrl, {
      params
    });
  }

  getOrderById(orderId: string): Observable<ApiResponse<OrderDto>> {
    return this.http.get<ApiResponse<OrderDto>>(`${this.baseUrl}/${orderId}`);
  }

  updateStatus(
    orderId: string,
    request: UpdateOrderStatusRequest
  ): Observable<ApiResponse<OrderDto>> {
    return this.http.put<ApiResponse<OrderDto>>(
      `${this.baseUrl}/${orderId}/status`,
      request
    );
  }
}