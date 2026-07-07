import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VietnamDatePipe } from '../../../shared/pipes/vietnam-date.pipe';
import { ProductDto, ProductQueryRequest } from '../../../core/models/product.model';
import {
  InventoryCreateRequest,
  InventoryDto,
  InventoryQueryRequest,
  InventoryUpdateRequest
} from '../../../core/models/inventory.model';
import { AdminInventoryService } from '../../../core/services/admin-inventory.service';
import { AdminProductService } from '../../../core/services/admin-product.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, VietnamDatePipe],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  inventories: InventoryDto[] = [];
  products: ProductDto[] = [];

  lowStockItems: InventoryDto[] = [];
  nearExpiryItems: InventoryDto[] = [];

  query: InventoryQueryRequest = {
    keyword: '',
    productId: '',
    page: 1,
    pageSize: 10
  };

  totalItems = 0;
  totalPages = 0;

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  showForm = false;
  editingInventory: InventoryDto | null = null;

  form = {
    productId: '',
    batchNumber: '',
    quantity: 0,
    importPrice: 0,
    sellingPrice: 0,
    manufactureDate: '',
    expiryDate: '',
    lowStockThreshold: 10
  };

  constructor(
    private inventoryService: AdminInventoryService,
    private productService: AdminProductService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadInventory();
    this.loadAlerts();
  }

  loadProducts(): void {
    const request: ProductQueryRequest = {
      keyword: '',
      categoryId: '',
      page: 1,
      pageSize: 100,
      sortBy: 'name_asc'
    };

    this.productService.getPaged(request).subscribe({
      next: response => {
        this.products = response.data?.items ?? [];

        if (!this.form.productId && this.products.length > 0) {
          this.form.productId = this.products[0].id;
        }
      },
      error: error => {
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách sản phẩm.';

        this.toastService.error(
          'Tải sản phẩm thất bại',
          this.errorMessage
        );
      }
    });
  }

  loadInventory(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: InventoryQueryRequest = {
      ...this.query,
      keyword: this.query.keyword?.trim() || undefined,
      productId: this.query.productId || undefined
    };

    this.inventoryService.getPaged(request).subscribe({
      next: response => {
        this.loading = false;
        this.inventories = response.data?.items ?? [];
        this.totalItems = response.data?.totalItems ?? 0;
        this.totalPages = response.data?.totalPages ?? 0;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách tồn kho.';

        this.toastService.error(
          'Tải tồn kho thất bại',
          this.errorMessage
        );
      }
    });
  }

  loadAlerts(): void {
    this.inventoryService.getLowStock().subscribe({
      next: response => {
        this.lowStockItems = response.data ?? [];
      },
      error: () => {
        this.lowStockItems = [];
      }
    });

    this.inventoryService.getNearExpiry(60).subscribe({
      next: response => {
        this.nearExpiryItems = response.data ?? [];
      },
      error: () => {
        this.nearExpiryItems = [];
      }
    });
  }

  search(): void {
    this.query.page = 1;
    this.loadInventory();
  }

  filterProduct(): void {
    this.query.page = 1;
    this.loadInventory();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) {
      return;
    }

    this.query.page = page;
    this.loadInventory();
  }

  openCreateForm(): void {
    this.showForm = true;
    this.editingInventory = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
  }

  openEditForm(inventory: InventoryDto): void {
    this.showForm = true;
    this.editingInventory = inventory;
    this.errorMessage = '';
    this.successMessage = '';

    this.form = {
      productId: inventory.productId,
      batchNumber: inventory.batchNumber,
      quantity: inventory.quantity,
      importPrice: inventory.importPrice,
      sellingPrice: inventory.sellingPrice,
      manufactureDate: this.toDateInputValue(inventory.manufactureDate),
      expiryDate: this.toDateInputValue(inventory.expiryDate),
      lowStockThreshold: inventory.lowStockThreshold
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.editingInventory = null;
  }

  resetForm(): void {
    this.form = {
      productId: this.products[0]?.id ?? '',
      batchNumber: '',
      quantity: 0,
      importPrice: 0,
      sellingPrice: 0,
      manufactureDate: '',
      expiryDate: '',
      lowStockThreshold: 10
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

    if (!this.form.productId) {
      this.errorMessage = 'Vui lòng chọn sản phẩm.';
      return;
    }

    if (!this.form.batchNumber.trim()) {
      this.errorMessage = 'Vui lòng nhập số lô.';
      return;
    }

    if (Number(this.form.quantity) < 0) {
      this.errorMessage = 'Số lượng không được âm.';
      return;
    }

    if (Number(this.form.importPrice) < 0) {
      this.errorMessage = 'Giá nhập không được âm.';
      return;
    }

    if (Number(this.form.sellingPrice) <= 0) {
      this.errorMessage = 'Giá bán phải lớn hơn 0.';
      return;
    }

    if (!this.form.expiryDate) {
      this.errorMessage = 'Vui lòng nhập hạn sử dụng.';
      return;
    }

    if (Number(this.form.lowStockThreshold) < 0) {
      this.errorMessage = 'Ngưỡng cảnh báo không được âm.';
      return;
    }

    this.saving = true;

    if (this.editingInventory) {
      const request: InventoryUpdateRequest = {
        productId: this.form.productId,
        batchNumber: this.form.batchNumber.trim(),
        quantity: Number(this.form.quantity),
        importPrice: Number(this.form.importPrice),
        sellingPrice: Number(this.form.sellingPrice),
        manufactureDate: this.form.manufactureDate || undefined,
        expiryDate: this.form.expiryDate,
        lowStockThreshold: Number(this.form.lowStockThreshold)
      };

      this.inventoryService.update(this.editingInventory.id, request).subscribe({
        next: response => {
          this.saving = false;
          this.successMessage =
            response.message ||
            'Cập nhật lô hàng thành công.';

          this.toastService.success(
            'Cập nhật thành công',
            this.successMessage
          );

          this.cancelEdit();
          this.loadInventory();
          this.loadAlerts();
        },
        error: error => {
          this.saving = false;
          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Cập nhật lô hàng thất bại.';

          this.toastService.error(
            'Cập nhật thất bại',
            this.errorMessage
          );
        }
      });

      return;
    }

    const request: InventoryCreateRequest = {
      productId: this.form.productId,
      batchNumber: this.form.batchNumber.trim(),
      quantity: Number(this.form.quantity),
      importPrice: Number(this.form.importPrice),
      sellingPrice: Number(this.form.sellingPrice),
      manufactureDate: this.form.manufactureDate || undefined,
      expiryDate: this.form.expiryDate,
      lowStockThreshold: Number(this.form.lowStockThreshold)
    };

    this.inventoryService.create(request).subscribe({
      next: response => {
        this.saving = false;
        this.successMessage =
          response.message ||
          'Thêm lô hàng thành công.';

        this.toastService.success(
          'Thêm thành công',
          this.successMessage
        );

        this.cancelEdit();
        this.loadInventory();
        this.loadAlerts();
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Thêm lô hàng thất bại.';

        this.toastService.error(
          'Thêm thất bại',
          this.errorMessage
        );
      }
    });
  }

  async deleteInventory(inventory: InventoryDto): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = await this.confirmService.confirm({
      title: 'Xóa lô hàng?',
      message: `Bạn có chắc muốn xóa lô "${inventory.batchNumber}" của sản phẩm "${inventory.productName}" không? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa lô hàng',
      cancelText: 'Hủy',
      icon: 'delete',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.inventoryService.delete(inventory.id).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage =
          response.message ||
          'Đã xóa lô hàng.';

        this.toastService.success(
          'Xóa thành công',
          this.successMessage
        );

        this.loadInventory();
        this.loadAlerts();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Xóa lô hàng thất bại.';

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

  getInventoryStatusClass(item: InventoryDto): string {
    if (item.quantity <= 0) {
      return 'status-out-stock';
    }

    if (item.quantity <= item.lowStockThreshold) {
      return 'status-low-stock';
    }

    if (item.isNearExpiry) {
      return 'status-near-expiry';
    }

    return 'status-normal';
  }

  getInventoryStatusText(item: InventoryDto): string {
    if (item.quantity <= 0) {
      return 'Hết hàng';
    }

    if (item.quantity <= item.lowStockThreshold) {
      return 'Sắp hết hàng';
    }

    if (item.isNearExpiry) {
      return 'Gần hết hạn';
    }

    return 'Bình thường';
  }

  private toDateInputValue(value?: string): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 10);
  }
}