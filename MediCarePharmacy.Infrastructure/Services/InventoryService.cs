using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Inventory;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<InventoryDto>>> GetPagedAsync(InventoryQueryRequest request)
    {
        if (request.Page <= 0)
        {
            request.Page = 1;
        }

        if (request.PageSize <= 0)
        {
            request.PageSize = 10;
        }

        var query = _context.Inventories
            .Include(x => x.Product)
            .AsQueryable();

        if (request.ProductId.HasValue)
        {
            query = query.Where(x => x.ProductId == request.ProductId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();

            query = query.Where(x =>
                x.BatchNumber.ToLower().Contains(keyword) ||
                (x.Product != null && x.Product.Name.ToLower().Contains(keyword))
            );
        }

        query = query.OrderBy(x => x.ExpiryDate);

        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => MapToDto(x, 60))
            .ToListAsync();

        var result = new PagedResult<InventoryDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };

        return ApiResponse<PagedResult<InventoryDto>>.Ok(result);
    }

    public async Task<ApiResponse<InventoryDto>> GetByIdAsync(Guid id)
    {
        var inventory = await _context.Inventories
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (inventory == null)
        {
            return ApiResponse<InventoryDto>.Fail("Inventory not found");
        }

        return ApiResponse<InventoryDto>.Ok(MapToDto(inventory, 60));
    }

    public async Task<ApiResponse<List<InventoryDto>>> GetByProductIdAsync(Guid productId)
    {
        var productExists = await _context.Products.AnyAsync(x => x.Id == productId);

        if (!productExists)
        {
            return ApiResponse<List<InventoryDto>>.Fail("Product not found");
        }

        var inventories = await _context.Inventories
            .Include(x => x.Product)
            .Where(x => x.ProductId == productId)
            .OrderBy(x => x.ExpiryDate)
            .Select(x => MapToDto(x, 60))
            .ToListAsync();

        return ApiResponse<List<InventoryDto>>.Ok(inventories);
    }

    public async Task<ApiResponse<InventoryDto>> CreateAsync(InventoryCreateRequest request)
    {
        var validationError = await ValidateInventoryRequestAsync(
            request.ProductId,
            request.BatchNumber,
            request.Quantity,
            request.ImportPrice,
            request.SellingPrice,
            request.ExpiryDate,
            request.LowStockThreshold
        );

        if (validationError != null)
        {
            return ApiResponse<InventoryDto>.Fail(validationError);
        }

        var batchExists = await _context.Inventories
            .AnyAsync(x => x.ProductId == request.ProductId && x.BatchNumber == request.BatchNumber.Trim());

        if (batchExists)
        {
            return ApiResponse<InventoryDto>.Fail("Batch number already exists for this product");
        }

        var inventory = new Inventory
        {
            ProductId = request.ProductId,
            BatchNumber = request.BatchNumber.Trim(),
            Quantity = request.Quantity,
            ImportPrice = request.ImportPrice,
            SellingPrice = request.SellingPrice,
            ManufactureDate = request.ManufactureDate,
            ExpiryDate = request.ExpiryDate,
            LowStockThreshold = request.LowStockThreshold,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Inventories.AddAsync(inventory);
        await _context.SaveChangesAsync();

        var createdInventory = await _context.Inventories
            .Include(x => x.Product)
            .FirstAsync(x => x.Id == inventory.Id);

        return ApiResponse<InventoryDto>.Ok(
            MapToDto(createdInventory, 60),
            "Inventory created successfully"
        );
    }

    public async Task<ApiResponse<InventoryDto>> UpdateAsync(Guid id, InventoryUpdateRequest request)
    {
        var inventory = await _context.Inventories.FindAsync(id);

        if (inventory == null)
        {
            return ApiResponse<InventoryDto>.Fail("Inventory not found");
        }

        var validationError = await ValidateInventoryRequestAsync(
            request.ProductId,
            request.BatchNumber,
            request.Quantity,
            request.ImportPrice,
            request.SellingPrice,
            request.ExpiryDate,
            request.LowStockThreshold
        );

        if (validationError != null)
        {
            return ApiResponse<InventoryDto>.Fail(validationError);
        }

        var batchExists = await _context.Inventories
            .AnyAsync(x =>
                x.Id != id &&
                x.ProductId == request.ProductId &&
                x.BatchNumber == request.BatchNumber.Trim()
            );

        if (batchExists)
        {
            return ApiResponse<InventoryDto>.Fail("Batch number already exists for this product");
        }

        inventory.ProductId = request.ProductId;
        inventory.BatchNumber = request.BatchNumber.Trim();
        inventory.Quantity = request.Quantity;
        inventory.ImportPrice = request.ImportPrice;
        inventory.SellingPrice = request.SellingPrice;
        inventory.ManufactureDate = request.ManufactureDate;
        inventory.ExpiryDate = request.ExpiryDate;
        inventory.LowStockThreshold = request.LowStockThreshold;
        inventory.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var updatedInventory = await _context.Inventories
            .Include(x => x.Product)
            .FirstAsync(x => x.Id == id);

        return ApiResponse<InventoryDto>.Ok(
            MapToDto(updatedInventory, 60),
            "Inventory updated successfully"
        );
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var inventory = await _context.Inventories.FindAsync(id);

        if (inventory == null)
        {
            return ApiResponse<bool>.Fail("Inventory not found");
        }

        _context.Inventories.Remove(inventory);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Inventory deleted successfully");
    }

    public async Task<ApiResponse<List<InventoryDto>>> GetLowStockAsync()
    {
        var inventories = await _context.Inventories
            .Include(x => x.Product)
            .Where(x => x.Quantity <= x.LowStockThreshold)
            .OrderBy(x => x.Quantity)
            .Select(x => MapToDto(x, 60))
            .ToListAsync();

        return ApiResponse<List<InventoryDto>>.Ok(inventories);
    }

    public async Task<ApiResponse<List<InventoryDto>>> GetNearExpiryAsync(int days)
    {
        if (days <= 0)
        {
            days = 60;
        }

        var today = DateTime.UtcNow.Date;
        var targetDate = today.AddDays(days);

        var inventories = await _context.Inventories
            .Include(x => x.Product)
            .Where(x => x.ExpiryDate.Date <= targetDate && x.ExpiryDate.Date >= today)
            .OrderBy(x => x.ExpiryDate)
            .Select(x => MapToDto(x, days))
            .ToListAsync();

        return ApiResponse<List<InventoryDto>>.Ok(inventories);
    }

    private async Task<string?> ValidateInventoryRequestAsync(
        Guid productId,
        string batchNumber,
        int quantity,
        decimal importPrice,
        decimal sellingPrice,
        DateTime expiryDate,
        int lowStockThreshold)
    {
        if (productId == Guid.Empty)
        {
            return "Product is required";
        }

        var productExists = await _context.Products.AnyAsync(x => x.Id == productId);

        if (!productExists)
        {
            return "Product not found";
        }

        if (string.IsNullOrWhiteSpace(batchNumber))
        {
            return "Batch number is required";
        }

        if (quantity < 0)
        {
            return "Quantity cannot be negative";
        }

        if (importPrice < 0)
        {
            return "Import price cannot be negative";
        }

        if (sellingPrice <= 0)
        {
            return "Selling price must be greater than 0";
        }

        if (expiryDate.Date <= DateTime.UtcNow.Date)
        {
            return "Expiry date must be greater than today";
        }

        if (lowStockThreshold < 0)
        {
            return "Low stock threshold cannot be negative";
        }

        return null;
    }

    private static InventoryDto MapToDto(Inventory inventory, int nearExpiryDays)
    {
        var today = DateTime.UtcNow.Date;
        var daysToExpiry = (inventory.ExpiryDate.Date - today).Days;

        return new InventoryDto
        {
            Id = inventory.Id,
            ProductId = inventory.ProductId,
            ProductName = inventory.Product?.Name ?? string.Empty,
            BatchNumber = inventory.BatchNumber,
            Quantity = inventory.Quantity,
            ImportPrice = inventory.ImportPrice,
            SellingPrice = inventory.SellingPrice,
            ManufactureDate = inventory.ManufactureDate,
            ExpiryDate = inventory.ExpiryDate,
            LowStockThreshold = inventory.LowStockThreshold,
            IsLowStock = inventory.Quantity <= inventory.LowStockThreshold,
            IsNearExpiry = daysToExpiry >= 0 && daysToExpiry <= nearExpiryDays,
            DaysToExpiry = daysToExpiry
        };
    }
}