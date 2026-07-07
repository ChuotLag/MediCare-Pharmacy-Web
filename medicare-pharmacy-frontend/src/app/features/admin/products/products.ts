import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryDto } from '../../../core/models/category.model';
import { ProductDto, ProductQueryRequest } from '../../../core/models/product.model';
import { AdminCategoryService } from '../../../core/services/admin-category.service';
import {
  AdminProductService,
  ProductCreateRequest,
  ProductUpdateRequest
} from '../../../core/services/admin-product.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, CurrencyPipe],
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
    pageSize: 10,
    sortBy: 'newest'
  };

  totalItems = 0;
  totalPages = 0;

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  showForm = false;
  editingProduct: ProductDto | null = null;

  form = {
    categoryId: '',
    name: '',
    description: '',
    ingredients: '',
    usageInstructions: '',
    contraindications: '',
    manufacturer: '',
    origin: '',
    unit: '',
    price: 0,
    imageUrl: '',
    requiresPrescription: false,
    isActive: true
  };

  constructor(
    private productService: AdminProductService,
    private categoryService: AdminCategoryService,
    private confirmService: ConfirmService,
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

        if (!this.form.categoryId && this.categories.length > 0) {
          this.form.categoryId = this.categories[0].id;
        }
      },
      error: error => {
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách danh mục.';
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ProductQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      categoryId: this.query.categoryId || undefined,
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
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách sản phẩm.';
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadProducts();
  }

  filterCategory(): void {
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

  openCreateForm(): void {
    this.showForm = true;
    this.editingProduct = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
  }

  openEditForm(product: ProductDto): void {
    this.showForm = true;
    this.editingProduct = product;
    this.errorMessage = '';
    this.successMessage = '';

    this.form = {
      categoryId: product.categoryId,
      name: product.name,
      description: product.description ?? '',
      ingredients: product.ingredients ?? '',
      usageInstructions: product.usageInstructions ?? '',
      contraindications: product.contraindications ?? '',
      manufacturer: product.manufacturer ?? '',
      origin: product.origin ?? '',
      unit: product.unit,
      price: product.price,
      imageUrl: product.imageUrl ?? '',
      requiresPrescription: product.requiresPrescription,
      isActive: product.isActive
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
  }

  resetForm(): void {
    this.form = {
      categoryId: this.categories[0]?.id ?? '',
      name: '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      contraindications: '',
      manufacturer: '',
      origin: '',
      unit: '',
      price: 0,
      imageUrl: '',
      requiresPrescription: false,
      isActive: true
    };

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.closeForm();
    this.resetForm();
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.categoryId) {
      this.errorMessage = 'Vui lòng chọn danh mục.';
      return;
    }

    if (!this.form.name.trim()) {
      this.errorMessage = 'Vui lòng nhập tên sản phẩm.';
      return;
    }

    if (!this.form.unit.trim()) {
      this.errorMessage = 'Vui lòng nhập đơn vị.';
      return;
    }

    if (!this.form.price || Number(this.form.price) <= 0) {
      this.errorMessage = 'Giá sản phẩm phải lớn hơn 0.';
      return;
    }

    this.saving = true;

    if (this.editingProduct) {
      const request: ProductUpdateRequest = {
        categoryId: this.form.categoryId,
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        ingredients: this.form.ingredients.trim() || undefined,
        usageInstructions: this.form.usageInstructions.trim() || undefined,
        contraindications: this.form.contraindications.trim() || undefined,
        manufacturer: this.form.manufacturer.trim() || undefined,
        origin: this.form.origin.trim() || undefined,
        unit: this.form.unit.trim(),
        price: Number(this.form.price),
        imageUrl: this.form.imageUrl.trim() || undefined,
        requiresPrescription: this.form.requiresPrescription,
        isActive: this.form.isActive
      };

      this.productService.update(this.editingProduct.id, request).subscribe({
        next: response => {
          this.saving = false;
          this.successMessage = response.message || 'Cập nhật sản phẩm thành công.';

          this.toastService.success(
            'Cập nhật thành công',
            this.successMessage
          );

          this.cancelEdit();
          this.loadProducts();
        },
        error: error => {
          this.saving = false;
          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Cập nhật sản phẩm thất bại.';

          this.toastService.error(
            'Cập nhật thất bại',
            this.errorMessage
          );
        }
      });

      return;
    }

    const request: ProductCreateRequest = {
      categoryId: this.form.categoryId,
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
      ingredients: this.form.ingredients.trim() || undefined,
      usageInstructions: this.form.usageInstructions.trim() || undefined,
      contraindications: this.form.contraindications.trim() || undefined,
      manufacturer: this.form.manufacturer.trim() || undefined,
      origin: this.form.origin.trim() || undefined,
      unit: this.form.unit.trim(),
      price: Number(this.form.price),
      imageUrl: this.form.imageUrl.trim() || undefined,
      requiresPrescription: this.form.requiresPrescription
    };

    this.productService.create(request).subscribe({
      next: response => {
        this.saving = false;
        this.successMessage = response.message || 'Thêm sản phẩm thành công.';

        this.toastService.success(
          'Thêm thành công',
          this.successMessage
        );

        this.cancelEdit();
        this.loadProducts();
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Thêm sản phẩm thất bại.';

        this.toastService.error(
          'Thêm thất bại',
          this.errorMessage
        );
      }
    });
  }

  toggleActive(product: ProductDto): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.productService.toggleActive(product.id).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage =
          response.message ||
          'Cập nhật trạng thái sản phẩm thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );

        this.loadProducts();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Cập nhật trạng thái sản phẩm thất bại.';

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  async deleteProduct(product: ProductDto): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = await this.confirmService.confirm({
      title: 'Xóa sản phẩm?',
      message: `Bạn có chắc muốn xóa sản phẩm "${product.name}" không? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa sản phẩm',
      cancelText: 'Hủy',
      icon: 'delete',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.productService.delete(product.id).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage =
          response.message ||
          'Đã xóa sản phẩm.';

        this.toastService.success(
          'Xóa thành công',
          this.successMessage
        );

        this.loadProducts();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Xóa sản phẩm thất bại.';

        this.toastService.error(
          'Xóa thất bại',
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

  getStockClass(product: ProductDto): string {
    const stock = product.totalStock ?? 0;

    if (stock <= 0) {
      return 'stock-out';
    }

    if (stock <= 10) {
      return 'stock-low';
    }

    return 'stock-ok';
  }

  getStockText(product: ProductDto): string {
    const stock = product.totalStock ?? 0;

    if (stock <= 0) {
      return 'Hết hàng';
    }

    if (stock <= 10) {
      return `Sắp hết: ${stock}`;
    }

    return `Còn ${stock}`;
  }
}