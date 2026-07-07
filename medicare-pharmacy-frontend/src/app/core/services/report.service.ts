import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardSummaryDto,
  RevenueQueryRequest,
  RevenueReportDto,
  TopSellingProductDto
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<ApiResponse<DashboardSummaryDto>> {
    return this.http.get<ApiResponse<DashboardSummaryDto>>(
      `${this.baseUrl}/dashboard-summary`
    );
  }

  getRevenueReport(
    query: RevenueQueryRequest = {}
  ): Observable<ApiResponse<RevenueReportDto[]>> {
    let params = new HttpParams();

    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }

    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }

    return this.http.get<ApiResponse<RevenueReportDto[]>>(
      `${this.baseUrl}/revenue`,
      { params }
    );
  }

  getTopSellingProducts(top = 5): Observable<ApiResponse<TopSellingProductDto[]>> {
    const params = new HttpParams().set('top', top);

    return this.http.get<ApiResponse<TopSellingProductDto[]>>(
      `${this.baseUrl}/top-selling-products`,
      { params }
    );
  }
}