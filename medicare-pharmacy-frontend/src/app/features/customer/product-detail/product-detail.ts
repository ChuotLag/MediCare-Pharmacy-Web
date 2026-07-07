import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductDto } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { TokenService } from '../../../core/services/token.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-product-detail',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: ProductDto | null = null;

  quantity = 1;

  loading = false;
  adding = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private tokenService: TokenService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.errorMessage = 'Không tìm thấy sản phẩm.';

      this.toastService.error(
        'Không tìm thấy',
        this.errorMessage
      );

      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getBySlug(slug).subscribe({
      next: response => {
        this.loading = false;

        if (!response.data) {
          this.errorMessage = 'Không tìm thấy sản phẩm.';

          this.toastService.error(
            'Không tìm thấy',
            this.errorMessage
          );

          return;
        }

        this.product = response.data;
        this.quantity = this.product.totalStock > 0 ? 1 : 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải chi tiết sản phẩm.'
        );

        this.toastService.error(
          'Tải sản phẩm thất bại',
          this.errorMessage
        );
      }
    });
  }

  increase(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.product) {
      return;
    }

    if (this.quantity >= this.product.totalStock) {
      this.errorMessage = `Sản phẩm chỉ còn ${this.product.totalStock} trong kho.`;

      this.toastService.error(
        'Không đủ tồn kho',
        this.errorMessage
      );

      return;
    }

    this.quantity++;
  }

  decrease(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.quantity <= 1) {
      return;
    }

    this.quantity--;
  }

  addToCart(): void {
    this.addToCartInternal(false);
  }

  buyNow(): void {
    this.addToCartInternal(true);
  }

  private addToCartInternal(goToCartAfterAdd: boolean): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.product) {
      return;
    }

    if (!this.tokenService.isLoggedIn()) {
      this.toastService.error(
        'Cần đăng nhập',
        'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.'
      );

      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.tokenService.isCustomer()) {
      this.errorMessage = 'Chỉ tài khoản Customer mới có thể thêm sản phẩm vào giỏ.';

      this.toastService.error(
        'Không có quyền',
        this.errorMessage
      );

      return;
    }

    if (this.product.totalStock <= 0) {
      this.errorMessage = 'Sản phẩm hiện đã hết hàng.';

      this.toastService.error(
        'Hết hàng',
        this.errorMessage
      );

      return;
    }

    if (this.quantity <= 0) {
      this.errorMessage = 'Số lượng phải lớn hơn 0.';

      this.toastService.error(
        'Số lượng không hợp lệ',
        this.errorMessage
      );

      return;
    }

    if (this.quantity > this.product.totalStock) {
      this.errorMessage = `Sản phẩm chỉ còn ${this.product.totalStock} trong kho.`;

      this.toastService.error(
        'Không đủ tồn kho',
        this.errorMessage
      );

      return;
    }

    this.adding = true;

    this.cartService.addToCart({
      productId: this.product.id,
      quantity: this.quantity
    }).subscribe({
      next: response => {
        this.adding = false;

        this.successMessage =
          response.message ||
          `Đã thêm ${this.quantity} ${this.product?.unit} ${this.product?.name} vào giỏ hàng.`;

        this.toastService.success(
          'Thêm vào giỏ thành công',
          this.successMessage
        );

        if (goToCartAfterAdd) {
          this.router.navigate(['/cart']);
        }
      },
      error: error => {
        this.adding = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Thêm sản phẩm vào giỏ hàng thất bại.'
        );

        this.toastService.error(
          'Thêm vào giỏ thất bại',
          this.errorMessage
        );
      }
    });
  }

  goToUploadPrescription(): void {
    if (!this.tokenService.isLoggedIn()) {
      this.toastService.error(
        'Cần đăng nhập',
        'Vui lòng đăng nhập để upload đơn thuốc.'
      );

      this.router.navigate(['/auth/login']);
      return;
    }

    this.router.navigate(['/upload-prescription']);
  }

  getStockText(): string {
    if (!this.product) {
      return '';
    }

    if (this.product.totalStock <= 0) {
      return 'Tạm hết hàng';
    }

    if (this.product.totalStock <= 10) {
      return `Sắp hết hàng - còn ${this.product.totalStock}`;
    }

    return `Còn hàng - ${this.product.totalStock} sản phẩm`;
  }

  getStockClass(): string {
    if (!this.product || this.product.totalStock <= 0) {
      return 'stock-out';
    }

    if (this.product.totalStock <= 10) {
      return 'stock-low';
    }

    return 'stock-ok';
  }

  private getErrorMessage(error: any, fallback: string): string {
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  }
}