using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Products;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Infrastructure.Data;
using MediCarePharmacy.Infrastructure.Helpers;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<ProductDto>>> GetPagedAsync(
        ProductQueryRequest request,
        bool includeInactive = false)
    {
        if (request.Page <= 0)
        {
            request.Page = 1;
        }

        if (request.PageSize <= 0)
        {
            request.PageSize = 12;
        }

        var query = _context.Products
            .Include(x => x.Category)
            .Include(x => x.Inventories)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();

            query = query.Where(x =>
                x.Name.ToLower().Contains(keyword) ||
                x.Slug.ToLower().Contains(keyword) ||
                (x.Manufacturer != null && x.Manufacturer.ToLower().Contains(keyword))
            );
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == request.CategoryId.Value);
        }

        query = request.SortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(x => x.Price),
            "price_desc" => query.OrderByDescending(x => x.Price),
            "name_asc" => query.OrderBy(x => x.Name),
            "name_desc" => query.OrderByDescending(x => x.Name),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new ProductDto
            {
                Id = x.Id,
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name : string.Empty,
                Name = x.Name,
                Slug = x.Slug,
                Description = x.Description,
                Ingredients = x.Ingredients,
                UsageInstructions = x.UsageInstructions,
                Contraindications = x.Contraindications,
                Manufacturer = x.Manufacturer,
                Origin = x.Origin,
                Unit = x.Unit,
                Price = x.Price,
                ImageUrl = x.ImageUrl,
                RequiresPrescription = x.RequiresPrescription,
                IsActive = x.IsActive,
                TotalStock = x.Inventories.Sum(i => i.Quantity)
            })
            .ToListAsync();

        var result = new PagedResult<ProductDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };

        return ApiResponse<PagedResult<ProductDto>>.Ok(result);
    }

    public async Task<ApiResponse<ProductDto>> GetByIdAsync(Guid id)
    {
        var product = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Inventories)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product == null)
        {
            return ApiResponse<ProductDto>.Fail("Product not found");
        }

        return ApiResponse<ProductDto>.Ok(MapToDto(product));
    }

    public async Task<ApiResponse<ProductDto>> GetBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Inventories)
            .FirstOrDefaultAsync(x => x.Slug == slug);

        if (product == null)
        {
            return ApiResponse<ProductDto>.Fail("Product not found");
        }

        return ApiResponse<ProductDto>.Ok(MapToDto(product));
    }

    public async Task<ApiResponse<ProductDto>> CreateAsync(ProductCreateRequest request)
    {
        var validationError = await ValidateProductRequestAsync(request.CategoryId, request.Name, request.Price, request.Unit);

        if (validationError != null)
        {
            return ApiResponse<ProductDto>.Fail(validationError);
        }

        var slug = SlugHelper.GenerateSlug(request.Name);

        var slugExists = await _context.Products.AnyAsync(x => x.Slug == slug);

        if (slugExists)
        {
            return ApiResponse<ProductDto>.Fail("Product already exists");
        }

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description,
            Ingredients = request.Ingredients,
            UsageInstructions = request.UsageInstructions,
            Contraindications = request.Contraindications,
            Manufacturer = request.Manufacturer,
            Origin = request.Origin,
            Unit = request.Unit.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl,
            RequiresPrescription = request.RequiresPrescription,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        var createdProduct = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Inventories)
            .FirstAsync(x => x.Id == product.Id);

        return ApiResponse<ProductDto>.Ok(MapToDto(createdProduct), "Product created successfully");
    }

    public async Task<ApiResponse<ProductDto>> UpdateAsync(Guid id, ProductUpdateRequest request)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return ApiResponse<ProductDto>.Fail("Product not found");
        }

        var validationError = await ValidateProductRequestAsync(request.CategoryId, request.Name, request.Price, request.Unit);

        if (validationError != null)
        {
            return ApiResponse<ProductDto>.Fail(validationError);
        }

        var slug = SlugHelper.GenerateSlug(request.Name);

        var slugExists = await _context.Products
            .AnyAsync(x => x.Slug == slug && x.Id != id);

        if (slugExists)
        {
            return ApiResponse<ProductDto>.Fail("Product name already exists");
        }

        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Slug = slug;
        product.Description = request.Description;
        product.Ingredients = request.Ingredients;
        product.UsageInstructions = request.UsageInstructions;
        product.Contraindications = request.Contraindications;
        product.Manufacturer = request.Manufacturer;
        product.Origin = request.Origin;
        product.Unit = request.Unit.Trim();
        product.Price = request.Price;
        product.ImageUrl = request.ImageUrl;
        product.RequiresPrescription = request.RequiresPrescription;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var updatedProduct = await _context.Products
            .Include(x => x.Category)
            .Include(x => x.Inventories)
            .FirstAsync(x => x.Id == product.Id);

        return ApiResponse<ProductDto>.Ok(MapToDto(updatedProduct), "Product updated successfully");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return ApiResponse<bool>.Fail("Product not found");
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Product deleted successfully");
    }

    public async Task<ApiResponse<bool>> ToggleActiveAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return ApiResponse<bool>.Fail("Product not found");
        }

        product.IsActive = !product.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Product status updated successfully");
    }

    private async Task<string?> ValidateProductRequestAsync(
        Guid categoryId,
        string name,
        decimal price,
        string unit)
    {
        if (categoryId == Guid.Empty)
        {
            return "Category is required";
        }

        var categoryExists = await _context.Categories
            .AnyAsync(x => x.Id == categoryId);

        if (!categoryExists)
        {
            return "Category not found";
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            return "Product name is required";
        }

        if (string.IsNullOrWhiteSpace(unit))
        {
            return "Product unit is required";
        }

        if (price <= 0)
        {
            return "Product price must be greater than 0";
        }

        return null;
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Name = product.Name,
            Slug = product.Slug,
            Description = product.Description,
            Ingredients = product.Ingredients,
            UsageInstructions = product.UsageInstructions,
            Contraindications = product.Contraindications,
            Manufacturer = product.Manufacturer,
            Origin = product.Origin,
            Unit = product.Unit,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            RequiresPrescription = product.RequiresPrescription,
            IsActive = product.IsActive,
            TotalStock = product.Inventories.Sum(x => x.Quantity)
        };
    }
}