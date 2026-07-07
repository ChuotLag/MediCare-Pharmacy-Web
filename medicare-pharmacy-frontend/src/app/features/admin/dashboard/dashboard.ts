import { RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { DashboardSummaryDto, RevenueReportDto } from '../../../core/models/report.model';
import { InventoryDto } from '../../../core/models/inventory.model';
import { OrderDto, OrderQueryRequest } from '../../../core/models/order.model';
import { ReportService } from '../../../core/services/report.service';
import { AdminInventoryService } from '../../../core/services/admin-inventory.service';
import { AdminOrderService } from '../../../core/services/admin-order.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  summary: DashboardSummaryDto | null = null;
  revenueData: RevenueReportDto[] = [];
  lowStockItems: InventoryDto[] = [];
  nearExpiryItems: InventoryDto[] = [];
  recentOrders: OrderDto[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private reportService: ReportService,
    private inventoryService: AdminInventoryService,
    private orderService: AdminOrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.loadSummary();
    this.loadRevenue();
    this.loadLowStock();
    this.loadNearExpiry();
    this.loadRecentOrders();

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
    this.reportService.getRevenueReport().subscribe({
      next: response => {
        this.revenueData = response.data ?? [];
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  loadLowStock(): void {
    this.inventoryService.getLowStock().subscribe({
      next: response => {
        this.lowStockItems = (response.data ?? []).slice(0, 5);
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  loadNearExpiry(): void {
    this.inventoryService.getNearExpiry(60).subscribe({
      next: response => {
        this.nearExpiryItems = (response.data ?? []).slice(0, 5);
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
  }

  loadRecentOrders(): void {
    const query: OrderQueryRequest = {
      keyword: '',
      status: '',
      page: 1,
      pageSize: 5
    };

    this.orderService.getAllOrders(query).subscribe({
      next: response => {
        this.recentOrders = response.data?.items ?? [];
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Preparing':
        return 'status-preparing';
      case 'Shipping':
        return 'status-shipping';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }
}