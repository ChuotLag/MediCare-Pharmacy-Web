import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CategoryDto } from '../../../core/models/category.model';
import {
  AdminCategoryService,
  CategoryCreateRequest,
  CategoryUpdateRequest
} from '../../../core/services/admin-category.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {
  categories: CategoryDto[] = [];
  filteredCategories: CategoryDto[] = [];

  keyword = '';

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  showForm = false;
  editingCategory: CategoryDto | null = null;

  form = {
    name: '',
    description: '',
    imageUrl: '',
    isActive: true
  };

  constructor(
    private categoryService: AdminCategoryService,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.categoryService.getAll().subscribe({
      next: response => {
        this.loading = false;
        this.categories = response.data ?? [];
        this.applyFilter();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Không thể tải danh sách danh mục.';
      }
    });
  }

  applyFilter(): void {
    const keyword = this.keyword.trim().toLowerCase();

    if (!keyword) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories.filter(x =>
      x.name.toLowerCase().includes(keyword) ||
      x.slug.toLowerCase().includes(keyword) ||
      (x.description ?? '').toLowerCase().includes(keyword)
    );
  }

  openCreateForm(): void {
    this.showForm = true;
    this.editingCategory = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
  }

  openEditForm(category: CategoryDto): void {
    this.showForm = true;
    this.editingCategory = category;
    this.errorMessage = '';
    this.successMessage = '';

    this.form = {
      name: category.name,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      isActive: category.isActive
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCategory = null;
  }

  resetForm(): void {
    this.form = {
      name: '',
      description: '',
      imageUrl: '',
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

    if (!this.form.name.trim()) {
      this.errorMessage = 'Vui lòng nhập tên danh mục.';
      return;
    }

    this.saving = true;

    if (this.editingCategory) {
      const request: CategoryUpdateRequest = {
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        imageUrl: this.form.imageUrl.trim() || undefined,
        isActive: this.form.isActive
      };

      this.categoryService.update(this.editingCategory.id, request).subscribe({
        next: response => {
          this.saving = false;
          this.successMessage = response.message || 'Cập nhật danh mục thành công.';

          this.toastService.success(
            'Cập nhật thành công',
            this.successMessage
          );

          this.cancelEdit();
          this.loadCategories();
        },
        error: error => {
          this.saving = false;
          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Cập nhật danh mục thất bại.';

          this.toastService.error(
            'Cập nhật thất bại',
            this.errorMessage
          );
        }
      });

      return;
    }

    const request: CategoryCreateRequest = {
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
      imageUrl: this.form.imageUrl.trim() || undefined
    };

    this.categoryService.create(request).subscribe({
      next: response => {
        this.saving = false;
        this.successMessage = response.message || 'Tạo danh mục thành công.';

        this.toastService.success(
          'Tạo thành công',
          this.successMessage
        );

        this.cancelEdit();
        this.loadCategories();
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Tạo danh mục thất bại.';

        this.toastService.error(
          'Tạo thất bại',
          this.errorMessage
        );
      }
    });
  }

  toggleActive(category: CategoryDto): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.categoryService.toggleActive(category.id).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage = response.message || 'Cập nhật danh mục thành công.';

        this.toastService.success(
          'Cập nhật thành công',
          this.successMessage
        );

        this.cancelEdit();
        this.loadCategories();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Cập nhật danh mục thất bại.';

        this.toastService.error(
          'Cập nhật thất bại',
          this.errorMessage
        );
      }
    });
  }

  async deleteCategory(id: string, categoryName?: string): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const confirmed = await this.confirmService.confirm({
      title: 'Xóa danh mục?',
      message: categoryName
        ? `Bạn có chắc muốn xóa danh mục "${categoryName}" không? Hành động này không thể hoàn tác.`
        : 'Bạn có chắc muốn xóa danh mục này không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa danh mục',
      cancelText: 'Hủy',
      icon: 'delete',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.categoryService.delete(id).subscribe({
      next: response => {
        this.successMessage = response.message || 'Xóa danh mục thành công.';

        this.toastService.success(
          'Xóa thành công',
          this.successMessage
        );

        this.loadCategories();
      },
      error: error => {
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Xóa danh mục thất bại.';

        this.toastService.error(
          'Xóa thất bại',
          this.errorMessage
        );
      }
    });
  }
}