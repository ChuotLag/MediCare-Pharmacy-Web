import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartDto, CartItemDto } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cart: CartDto | null = null;

  loading = false;
  updating = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private cartService: CartService,
    private router: Router,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cartService.getCart().subscribe({
      next: response => {
        this.loading = false;
        this.cart = response.data;
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

  increase(item: CartItemDto): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (item.quantity >= item.availableStock) {
      this.errorMessage = `Sản phẩm ${item.productName} chỉ còn ${item.availableStock} sản phẩm.`;

      this.toastService.error(
        'Không đủ tồn kho',
        this.errorMessage
      );

      return;
    }

    this.updateQuantity(item, item.quantity + 1);
  }

  decrease(item: CartItemDto): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(item, item.quantity - 1);
  }

  updateQuantity(item: CartItemDto, quantity: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.updating = true;

    this.cartService.updateCartItem(item.id, { quantity }).subscribe({
      next: response => {
        this.updating = false;

        if (response.data) {
          this.cart = response.data;
        }

        this.successMessage =
          response.message ||
          'Cập nhật giỏ hàng thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );
      },
      error: error => {
        this.updating = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Cập nhật giỏ hàng thất bại.'
        );

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  async removeItem(item: CartItemDto): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = await this.confirmService.confirm({
      title: 'Xóa sản phẩm?',
      message: `Bạn có chắc muốn xóa "${item.productName}" khỏi giỏ hàng không?`,
      confirmText: 'Xóa sản phẩm',
      cancelText: 'Hủy',
      icon: 'delete',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.updating = true;

    this.cartService.removeCartItem(item.id).subscribe({
      next: response => {
        this.updating = false;

        if (response.data) {
          this.cart = response.data;
        } else {
          this.loadCart();
        }

        this.successMessage =
          response.message ||
          'Đã xóa sản phẩm khỏi giỏ hàng.';

        this.toastService.success(
          'Xóa thành công',
          this.successMessage
        );
      },
      error: error => {
        this.updating = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Xóa sản phẩm khỏi giỏ hàng thất bại.'
        );

        this.toastService.error(
          'Xóa thất bại',
          this.errorMessage
        );
      }
    });
  }

  async clearCart(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Giỏ hàng đang trống.';

      this.toastService.error(
        'Không thể xóa',
        this.errorMessage
      );

      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Xóa toàn bộ giỏ hàng?',
      message: 'Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      icon: 'remove_shopping_cart',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.updating = true;

    this.cartService.clearCart().subscribe({
      next: response => {
        this.updating = false;

        this.successMessage =
          response.message ||
          'Đã xóa toàn bộ giỏ hàng.';

        this.toastService.success(
          'Xóa giỏ hàng thành công',
          this.successMessage
        );

        this.loadCart();
      },
      error: error => {
        this.updating = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Xóa toàn bộ giỏ hàng thất bại.'
        );

        this.toastService.error(
          'Xóa thất bại',
          this.errorMessage
        );
      }
    });
  }

  goToCheckout(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Giỏ hàng đang trống.';

      this.toastService.error(
        'Không thể thanh toán',
        this.errorMessage
      );

      return;
    }

    const hasInvalidItem = this.cart.items.some(
      item => item.quantity > item.availableStock
    );

    if (hasInvalidItem) {
      this.errorMessage = 'Một số sản phẩm trong giỏ hàng không đủ tồn kho.';

      this.toastService.error(
        'Không đủ tồn kho',
        this.errorMessage
      );

      return;
    }

    this.router.navigate(['/checkout']);
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}