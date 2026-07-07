import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import {
  CreateOrderRequest,
  OrderDto,
  OrderQueryRequest
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly customerBaseUrl = `${environment.apiUrl}/Orders`;

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<OrderDto>> {
    return this.http.post<ApiResponse<OrderDto>>(this.customerBaseUrl, request);
  }

  getMyOrders(query: OrderQueryRequest): Observable<ApiResponse<PagedResult<OrderDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<ApiResponse<PagedResult<OrderDto>>>(
      `${this.customerBaseUrl}/my-orders`,
      { params }
    );
  }

  getMyOrderById(orderId: string): Observable<ApiResponse<OrderDto>> {
    return this.http.get<ApiResponse<OrderDto>>(
      `${this.customerBaseUrl}/my-orders/${orderId}`
    );
  }

  cancelMyOrder(orderId: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.customerBaseUrl}/${orderId}/cancel`,
      {}
    );
  }
}