import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OrderDto, OrderQueryRequest } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-customer-my-orders',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {
  orders: OrderDto[] = [];

  query: OrderQueryRequest = {
    keyword: '',
    status: '',
    page: 1,
    pageSize: 10
  };

  totalItems = 0;
  totalPages = 0;

  selectedOrder: OrderDto | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  orderStatuses = [
    '',
    'Pending',
    'Confirmed',
    'Preparing',
    'Shipping',
    'Completed',
    'Cancelled'
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: OrderQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      status: this.query.status || undefined
    };

    this.orderService.getMyOrders(request).subscribe({
      next: response => {
        this.loading = false;
        this.orders = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadOrders();
  }

  filterStatus(): void {
    this.query.page = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) {
      return;
    }

    this.query.page = page;
    this.loadOrders();
  }

  viewDetail(order: OrderDto): void {
    this.selectedOrder = order;
  }

  closeDetail(): void {
    this.selectedOrder = null;
  }

  cancelOrder(order: OrderDto): void {
    const confirmed = confirm(`Bạn có chắc muốn hủy đơn ${order.orderCode}?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.cancelMyOrder(order.id).subscribe({
      next: () => {
        this.successMessage = `Đã hủy đơn ${order.orderCode}.`;
        this.selectedOrder = null;
        this.loadOrders();
      },
      error: error => {
        this.errorMessage = error.message;
      }
    });
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

  getPaymentStatusClass(status: string): string {
    if (status === 'Paid') {
      return 'payment-paid';
    }

    if (status === 'Refunded') {
      return 'payment-refunded';
    }

    return 'payment-unpaid';
  }

  get pages(): number[] {
    const result: number[] = [];

    for (let i = 1; i <= this.totalPages; i++) {
      result.push(i);
    }

    return result.slice(0, 5);
  }
}