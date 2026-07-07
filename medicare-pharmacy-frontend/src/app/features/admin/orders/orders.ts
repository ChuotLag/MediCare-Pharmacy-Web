import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderDto, OrderQueryRequest } from '../../../core/models/order.model';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';
import { VietnamDatePipe } from '../../../shared/pipes/vietnam-date.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, VietnamDatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: OrderDto[] = [];

  query: OrderQueryRequest = {
    keyword: '',
    status: '',
    page: 1,
    pageSize: 10
  };

  totalItems = 0;
  totalPages = 0;

  loading = false;
  updating = false;
  errorMessage = '';
  successMessage = '';

  selectedOrder: OrderDto | null = null;
  selectedStatus = '';

  orderStatuses = [
    '',
    'Pending',
    'Confirmed',
    'Preparing',
    'Shipping',
    'Completed',
    'Cancelled'
  ];

  statusOptions = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Shipping',
    'Completed',
    'Cancelled'
  ];

  constructor(
    private orderService: AdminOrderService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

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

    this.orderService.getAllOrders(request).subscribe({
      next: response => {
        this.loading = false;
        this.orders = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách đơn hàng.';

        this.toastService.error(
          'Tải thất bại',
          this.errorMessage
        );
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
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.orderService.getOrderById(order.id).subscribe({
      next: response => {
        this.loading = false;

        if (!response.data) {
          this.errorMessage = 'Không tìm thấy chi tiết đơn hàng.';
          return;
        }

        this.selectedOrder = response.data;
        this.selectedStatus = response.data.status;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải chi tiết đơn hàng.';

        this.toastService.error(
          'Tải thất bại',
          this.errorMessage
        );
      }
    });
  }

  closeDetail(): void {
    this.selectedOrder = null;
    this.selectedStatus = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  async updateStatus(): Promise<void> {
    if (!this.selectedOrder) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedStatus) {
      this.errorMessage = 'Vui lòng chọn trạng thái đơn hàng.';
      return;
    }

    if (this.selectedStatus === this.selectedOrder.status) {
      this.errorMessage = 'Trạng thái mới đang giống trạng thái hiện tại.';
      return;
    }

    if (this.selectedOrder.status === 'Cancelled') {
      this.errorMessage = 'Đơn hàng đã hủy không thể cập nhật trạng thái.';
      this.toastService.error(
        'Không thể cập nhật',
        this.errorMessage
      );
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Cập nhật trạng thái đơn hàng?',
      message: `Bạn có chắc muốn cập nhật đơn ${this.selectedOrder.orderCode} từ "${this.getStatusLabel(this.selectedOrder.status)}" sang "${this.getStatusLabel(this.selectedStatus)}" không?`,
      confirmText: 'Cập nhật',
      cancelText: 'Hủy',
      icon: this.getStatusConfirmIcon(this.selectedStatus),
      variant: this.getStatusConfirmVariant(this.selectedStatus)
    });

    if (!confirmed) {
      return;
    }

    this.updating = true;

    this.orderService.updateStatus(this.selectedOrder.id, {
      status: this.selectedStatus
    }).subscribe({
      next: response => {
        this.updating = false;

        if (response.data) {
          this.selectedOrder = response.data;
          this.selectedStatus = response.data.status;
        }

        this.successMessage =
          response.message ||
          'Cập nhật trạng thái đơn hàng thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );

        this.loadOrders();
      },
      error: error => {
        this.updating = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Cập nhật trạng thái đơn hàng thất bại.';

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  get pages(): number[] {
    const result: number[] = [];

    const maxVisiblePages = 5;
    const currentPage = this.query.page;
    const totalPages = this.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }

      return result;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'Preparing':
        return 'Đang chuẩn bị';
      case 'Shipping':
        return 'Đang giao';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'payment-paid';
      case 'Refunded':
        return 'payment-refunded';
      case 'Unpaid':
      default:
        return 'payment-unpaid';
    }
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'Paid':
        return 'Đã thanh toán';
      case 'Refunded':
        return 'Đã hoàn tiền';
      case 'Unpaid':
        return 'Chưa thanh toán';
      default:
        return status;
    }
  }

  getStatusConfirmIcon(status: string): string {
    switch (status) {
      case 'Pending':
        return 'schedule';
      case 'Confirmed':
        return 'verified';
      case 'Preparing':
        return 'inventory';
      case 'Shipping':
        return 'local_shipping';
      case 'Completed':
        return 'task_alt';
      case 'Cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusConfirmVariant(status: string): 'primary' | 'danger' | 'warning' | 'success' {
    switch (status) {
      case 'Cancelled':
        return 'danger';
      case 'Completed':
        return 'success';
      case 'Preparing':
        return 'warning';
      case 'Shipping':
      case 'Confirmed':
      case 'Pending':
      default:
        return 'primary';
    }
  }
}