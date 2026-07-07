import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CategoryDto } from '../../../core/models/category.model';
import { ProductDto, ProductQueryRequest } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { TokenService } from '../../../core/services/token.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  categories: CategoryDto[] = [];
  products: ProductDto[] = [];

  query: ProductQueryRequest = {
    keyword: '',
    categoryId: '',
    page: 1,
    pageSize: 12,
    sortBy: 'newest'
  };

  totalItems = 0;
  totalPages = 0;

  loading = false;
  addingProductId = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartService: CartService,
    private tokenService: TokenService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: response => {
        this.categories = response.data ?? [];
      },
      error: error => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải danh mục sản phẩm.'
        );

        this.toastService.error(
          'Tải danh mục thất bại',
          this.errorMessage
        );
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ProductQueryRequest = {
      ...this.query,
      categoryId: this.query.categoryId || undefined,
      keyword: this.query.keyword?.trim() || undefined,
      sortBy: this.query.sortBy === 'newest' ? undefined : this.query.sortBy
    };

    this.productService.getPaged(request).subscribe({
      next: response => {
        this.loading = false;

        this.products = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Không thể tải danh sách sản phẩm.'
        );

        this.toastService.error(
          'Tải sản phẩm thất bại',
          this.errorMessage
        );
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadProducts();
  }

  filterByCategory(categoryId: string): void {
    this.query.categoryId = categoryId;
    this.query.page = 1;
    this.loadProducts();
  }

  changeSort(): void {
    this.query.page = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) {
      return;
    }

    this.query.page = page;
    this.loadProducts();
  }

  addToCart(product: ProductDto): void {
    this.errorMessage = '';
    this.successMessage = '';

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

    if (product.totalStock <= 0) {
      this.errorMessage = 'Sản phẩm đã hết hàng.';

      this.toastService.error(
        'Hết hàng',
        this.errorMessage
      );

      return;
    }

    this.addingProductId = product.id;

    this.cartService.addToCart({
      productId: product.id,
      quantity: 1
    }).subscribe({
      next: response => {
        this.addingProductId = '';

        this.successMessage =
          response.message ||
          `Đã thêm ${product.name} vào giỏ hàng.`;

        this.toastService.success(
          'Thêm vào giỏ thành công',
          this.successMessage
        );
      },
      error: error => {
        this.addingProductId = '';

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

  isAdding(product: ProductDto): boolean {
    return this.addingProductId === product.id;
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

  getStockText(product: ProductDto): string {
    if (product.totalStock <= 0) {
      return 'Tạm hết hàng';
    }

    if (product.totalStock <= 10) {
      return `Sắp hết hàng - còn ${product.totalStock}`;
    }

    return `Còn hàng - ${product.totalStock} sản phẩm`;
  }

  getStockClass(product: ProductDto): string {
    if (product.totalStock <= 0) {
      return 'stock-out';
    }

    if (product.totalStock <= 10) {
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