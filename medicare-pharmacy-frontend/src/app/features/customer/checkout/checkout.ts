import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartDto } from '../../../core/models/cart.model';
import { CreateOrderRequest } from '../../../core/models/order.model';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { TokenService } from '../../../core/services/token.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-checkout',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cart: CartDto | null = null;

  form: CreateOrderRequest = {
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'COD',
    note: ''
  };

  loading = false;
  submitting = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private tokenService: TokenService,
    private router: Router,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fillUserInfo();
    this.loadCart();
  }

  fillUserInfo(): void {
    const user = this.tokenService.getUser();

    if (!user) {
      return;
    }

    this.form.customerName = user.fullName ?? '';
    this.form.customerPhone = user.phoneNumber ?? '';
    this.form.shippingAddress = user.address ?? '';
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cartService.getCart().subscribe({
      next: response => {
        this.loading = false;
        this.cart = response.data;

        if (!this.cart || this.cart.items.length === 0) {
          this.toastService.error(
            'Giỏ hàng trống',
            'Vui lòng thêm sản phẩm trước khi thanh toán.'
          );

          this.router.navigate(['/cart']);
        }
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải giỏ hàng.'
        );

        this.toastService.error(
          'Tải giỏ hàng thất bại',
          this.errorMessage
        );
      }
    });
  }

  async submit(): Promise<void> {
    this.errorMessage = '';

    const customerName = this.form.customerName.trim();
    const customerPhone = this.form.customerPhone.trim();
    const shippingAddress = this.form.shippingAddress.trim();
    const note = this.form.note?.trim();

    if (!customerName) {
      this.showValidationError('Vui lòng nhập họ tên người nhận.');
      return;
    }

    if (!customerPhone) {
      this.showValidationError('Vui lòng nhập số điện thoại.');
      return;
    }

    if (!shippingAddress) {
      this.showValidationError('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.showValidationError('Giỏ hàng đang trống.');
      return;
    }

    const hasInvalidStock = this.cart.items.some(
      item => item.availableStock <= 0 || item.quantity > item.availableStock
    );

    if (hasInvalidStock) {
      this.showValidationError(
        'Một số sản phẩm trong giỏ hàng không đủ tồn kho. Vui lòng kiểm tra lại giỏ hàng.'
      );
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Xác nhận đặt hàng?',
      message: `Bạn có chắc muốn đặt đơn hàng với tổng tiền ${this.cart.totalAmount.toLocaleString('vi-VN')} đ không?`,
      confirmText: 'Đặt hàng',
      cancelText: 'Hủy',
      icon: 'shopping_bag',
      variant: 'success'
    });

    if (!confirmed) {
      return;
    }

    this.submitting = true;

    const request: CreateOrderRequest = {
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod: this.form.paymentMethod,
      note: note || undefined
    };

    this.orderService.createOrder(request).subscribe({
      next: response => {
        this.submitting = false;

        if (!response.data) {
          this.errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại.';

          this.toastService.error(
            'Đặt hàng thất bại',
            this.errorMessage
          );

          return;
        }

        this.toastService.success(
          'Đặt hàng thành công',
          `Mã đơn hàng: ${response.data.orderCode}`
        );

        this.router.navigate(['/my-orders']);
      },
      error: error => {
        this.submitting = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Đặt hàng thất bại. Vui lòng thử lại.'
        );

        this.toastService.error(
          'Đặt hàng thất bại',
          this.errorMessage
        );
      }
    });
  }

  private showValidationError(message: string): void {
    this.errorMessage = message;

    this.toastService.error(
      'Thiếu thông tin',
      message
    );
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}