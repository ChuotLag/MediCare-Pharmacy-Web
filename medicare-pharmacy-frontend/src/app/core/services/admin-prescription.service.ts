import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PagedResult } from '../models/paged-result.model';
import {
  PrescriptionDto,
  PrescriptionQueryRequest
} from '../models/prescription.model';

export interface PrescriptionReviewRequest {
  status: string;
  adminNote?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPrescriptionService {
  private readonly baseUrl = `${environment.apiUrl}/admin/prescriptions`;

  constructor(private http: HttpClient) {}

  getAll(
    query: PrescriptionQueryRequest
  ): Observable<ApiResponse<PagedResult<PrescriptionDto>>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.keyword) {
      params = params.set('keyword', query.keyword);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<ApiResponse<PagedResult<PrescriptionDto>>>(
      this.baseUrl,
      { params }
    );
  }

  getById(id: string): Observable<ApiResponse<PrescriptionDto>> {
    return this.http.get<ApiResponse<PrescriptionDto>>(`${this.baseUrl}/${id}`);
  }

  review(
    id: string,
    request: PrescriptionReviewRequest
  ): Observable<ApiResponse<PrescriptionDto>> {
    return this.http.put<ApiResponse<PrescriptionDto>>(
      `${this.baseUrl}/${id}/review`,
      request
    );
  }
}