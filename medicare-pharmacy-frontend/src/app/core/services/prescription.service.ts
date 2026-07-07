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

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly baseUrl = `${environment.apiUrl}/Prescriptions`;

  constructor(private http: HttpClient) {}

  upload(file: File, orderId?: string): Observable<ApiResponse<PrescriptionDto>> {
    const formData = new FormData();

    formData.append('file', file);

    if (orderId) {
      formData.append('orderId', orderId);
    }

    return this.http.post<ApiResponse<PrescriptionDto>>(
      `${this.baseUrl}/upload`,
      formData
    );
  }

  getMyPrescriptions(
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
      `${this.baseUrl}/my-prescriptions`,
      { params }
    );
  }

  getMyPrescriptionById(id: string): Observable<ApiResponse<PrescriptionDto>> {
    return this.http.get<ApiResponse<PrescriptionDto>>(
      `${this.baseUrl}/my-prescriptions/${id}`
    );
  }
}