import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DashboardSummaryDto,
  RevenueReportDto,
  TopSellingProductDto
} from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-admin-reports',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  summary: DashboardSummaryDto | null = null;
  revenueData: RevenueReportDto[] = [];
  topProducts: TopSellingProductDto[] = [];

  loading = false;
  errorMessage = '';

  filter = {
    fromDate: '',
    toDate: '',
    top: 5
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadReports();
  }

  setDefaultDateRange(): void {
    const today = new Date();
    const from = new Date();

    from.setDate(today.getDate() - 30);

    this.filter.fromDate = this.toDateInputValue(from);
    this.filter.toDate = this.toDateInputValue(today);
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    this.loadSummary();
    this.loadRevenue();
    this.loadTopProducts();

    setTimeout(() => {
      this.loading = false;
    }, 400);
  }

  loadSummary(): void {
    this.reportService.getDashboardSummary().subscribe({
      next: response => {
        this.summary = response.data;
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  loadRevenue(): void {
    this.reportService.getRevenueReport({
      fromDate: this.filter.fromDate || undefined,
      toDate: this.filter.toDate || undefined
    }).subscribe({
      next: response => {
        this.revenueData = response.data ?? [];
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  loadTopProducts(): void {
    this.reportService.getTopSellingProducts(Number(this.filter.top) || 5).subscribe({
      next: response => {
        this.topProducts = response.data ?? [];
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  applyFilter(): void {
    if (this.filter.fromDate && this.filter.toDate) {
      const from = new Date(this.filter.fromDate);
      const to = new Date(this.filter.toDate);

      if (from > to) {
        this.errorMessage = 'Từ ngày không được lớn hơn đến ngày.';
        return;
      }
    }

    this.loadReports();
  }

  resetFilter(): void {
    this.setDefaultDateRange();
    this.filter.top = 5;
    this.loadReports();
  }

  getMaxRevenue(): number {
    if (this.revenueData.length === 0) {
      return 1;
    }

    return Math.max(...this.revenueData.map(x => x.totalRevenue), 1);
  }

  getRevenueHeight(value: number): number {
    return Math.max((value / this.getMaxRevenue()) * 100, 8);
  }

  getTotalRevenueInRange(): number {
    return this.revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  }

  getTotalOrdersInRange(): number {
    return this.revenueData.reduce((sum, item) => sum + item.totalOrders, 0);
  }

  getAverageOrderValue(): number {
    const totalOrders = this.getTotalOrdersInRange();

    if (totalOrders === 0) {
      return 0;
    }

    return this.getTotalRevenueInRange() / totalOrders;
  }

  getTopProductMaxQuantity(): number {
    if (this.topProducts.length === 0) {
      return 1;
    }

    return Math.max(...this.topProducts.map(x => x.totalQuantitySold), 1);
  }

  getTopProductWidth(quantity: number): number {
    return Math.max((quantity / this.getTopProductMaxQuantity()) * 100, 8);
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().substring(0, 10);
  }
}