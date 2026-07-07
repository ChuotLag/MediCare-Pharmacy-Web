import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import { AdminUserQueryRequest, UserDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(query: AdminUserQueryRequest): Observable<ApiResponse<PagedResult<UserDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.role) {
      params = params.set('role', query.role);
    }

    if (query.isActive !== null && query.isActive !== undefined) {
      params = params.set('isActive', query.isActive);
    }

    return this.http.get<ApiResponse<PagedResult<UserDto>>>(this.baseUrl, {
      params
    });
  }

  getById(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.patch<ApiResponse<UserDto>>(
      `${this.baseUrl}/${id}/toggle-active`,
      {}
    );
  }
}