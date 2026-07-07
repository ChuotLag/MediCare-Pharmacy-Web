using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Categories;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Infrastructure.Data;
using MediCarePharmacy.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.Categories.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(x => x.IsActive);
            }

            var categories = await query
                .OrderBy(x => x.Name)
                .Select(x => new CategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Slug = x.Slug,
                    Description = x.Description,
                    ImageUrl = x.ImageUrl,
                    IsActive = x.IsActive
                })
                .ToListAsync();

            return ApiResponse<List<CategoryDto>>.Ok(categories);
        }

        public async Task<ApiResponse<CategoryDto>> GetByIdAsync(Guid id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(x => x.Id == id);

            if (category == null)
            {
                return ApiResponse<CategoryDto>.Fail("Category not found");
            }

            return ApiResponse<CategoryDto>.Ok(MapToDto(category));
        }

        public async Task<ApiResponse<CategoryDto>> CreateAsync(CategoryCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ApiResponse<CategoryDto>.Fail("Category name is required");
            }

            var slug = SlugHelper.GenerateSlug(request.Name);

            var slugExists = await _context.Categories
                .AnyAsync(x => x.Slug == slug);

            if (slugExists)
            {
                return ApiResponse<CategoryDto>.Fail("Category already exists");
            }

            var category = new Category
            {
                Name = request.Name.Trim(),
                Slug = slug,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            return ApiResponse<CategoryDto>.Ok(MapToDto(category), "Category created successfully");
        }

        public async Task<ApiResponse<CategoryDto>> UpdateAsync(Guid id, CategoryUpdateRequest request)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return ApiResponse<CategoryDto>.Fail("Category not found");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ApiResponse<CategoryDto>.Fail("Category name is required");
            }

            var slug = SlugHelper.GenerateSlug(request.Name);

            var slugExists = await _context.Categories
                .AnyAsync(x => x.Slug == slug && x.Id != id);

            if (slugExists)
            {
                return ApiResponse<CategoryDto>.Fail("Category name already exists");
            }

            category.Name = request.Name.Trim();
            category.Slug = slug;
            category.Description = request.Description;
            category.ImageUrl = request.ImageUrl;
            category.IsActive = request.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<CategoryDto>.Ok(MapToDto(category), "Category updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return ApiResponse<bool>.Fail("Category not found");
            }

            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Category deleted successfully");
        }

        public async Task<ApiResponse<bool>> ToggleActiveAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return ApiResponse<bool>.Fail("Category not found");
            }

            category.IsActive = !category.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Category status updated successfully");
        }

        private static CategoryDto MapToDto(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive
            };
        }
    }
}
