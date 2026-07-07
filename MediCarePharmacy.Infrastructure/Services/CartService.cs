using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Cart;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<CartDto>> GetCartAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        var cartDto = await BuildCartDtoAsync(cart.Id);

        return ApiResponse<CartDto>.Ok(cartDto);
    }

    public async Task<ApiResponse<CartDto>> AddToCartAsync(Guid userId, AddToCartRequest request)
    {
        if (request.ProductId == Guid.Empty)
        {
            return ApiResponse<CartDto>.Fail("Product is required");
        }

        if (request.Quantity <= 0)
        {
            return ApiResponse<CartDto>.Fail("Quantity must be greater than 0");
        }

        var product = await _context.Products
            .Include(x => x.Inventories)
            .FirstOrDefaultAsync(x => x.Id == request.ProductId && x.IsActive);

        if (product == null)
        {
            return ApiResponse<CartDto>.Fail("Product not found or inactive");
        }

        var availableStock = product.Inventories.Sum(x => x.Quantity);

        if (availableStock <= 0)
        {
            return ApiResponse<CartDto>.Fail("Product is out of stock");
        }

        var cart = await GetOrCreateCartAsync(userId);

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(x => x.CartId == cart.Id && x.ProductId == request.ProductId);

        if (existingItem == null)
        {
            if (request.Quantity > availableStock)
            {
                return ApiResponse<CartDto>.Fail($"Only {availableStock} items are available in stock");
            }

            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = request.Quantity,
                UnitPrice = product.Price,
                CreatedAt = DateTime.UtcNow
            };

            await _context.CartItems.AddAsync(cartItem);
        }
        else
        {
            var newQuantity = existingItem.Quantity + request.Quantity;

            if (newQuantity > availableStock)
            {
                return ApiResponse<CartDto>.Fail($"Only {availableStock} items are available in stock");
            }

            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = product.Price;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var cartDto = await BuildCartDtoAsync(cart.Id);

        return ApiResponse<CartDto>.Ok(cartDto, "Product added to cart successfully");
    }

    public async Task<ApiResponse<CartDto>> UpdateCartItemAsync(
        Guid userId,
        Guid cartItemId,
        UpdateCartItemRequest request)
    {
        if (request.Quantity <= 0)
        {
            return ApiResponse<CartDto>.Fail("Quantity must be greater than 0");
        }

        var cart = await GetOrCreateCartAsync(userId);

        var cartItem = await _context.CartItems
            .Include(x => x.Product)
            .ThenInclude(x => x!.Inventories)
            .FirstOrDefaultAsync(x => x.Id == cartItemId && x.CartId == cart.Id);

        if (cartItem == null)
        {
            return ApiResponse<CartDto>.Fail("Cart item not found");
        }

        if (cartItem.Product == null || !cartItem.Product.IsActive)
        {
            return ApiResponse<CartDto>.Fail("Product not found or inactive");
        }

        var availableStock = cartItem.Product.Inventories.Sum(x => x.Quantity);

        if (request.Quantity > availableStock)
        {
            return ApiResponse<CartDto>.Fail($"Only {availableStock} items are available in stock");
        }

        cartItem.Quantity = request.Quantity;
        cartItem.UnitPrice = cartItem.Product.Price;
        cartItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var cartDto = await BuildCartDtoAsync(cart.Id);

        return ApiResponse<CartDto>.Ok(cartDto, "Cart item updated successfully");
    }

    public async Task<ApiResponse<CartDto>> RemoveCartItemAsync(Guid userId, Guid cartItemId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(x => x.Id == cartItemId && x.CartId == cart.Id);

        if (cartItem == null)
        {
            return ApiResponse<CartDto>.Fail("Cart item not found");
        }

        _context.CartItems.Remove(cartItem);

        await _context.SaveChangesAsync();

        var cartDto = await BuildCartDtoAsync(cart.Id);

        return ApiResponse<CartDto>.Ok(cartDto, "Cart item removed successfully");
    }

    public async Task<ApiResponse<bool>> ClearCartAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        var cartItems = await _context.CartItems
            .Where(x => x.CartId == cart.Id)
            .ToListAsync();

        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Cart cleared successfully");
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cart != null)
        {
            return cart;
        }

        cart = new Cart
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Carts.AddAsync(cart);
        await _context.SaveChangesAsync();

        return cart;
    }

    private async Task<CartDto> BuildCartDtoAsync(Guid cartId)
    {
        var cart = await _context.Carts
            .Include(x => x.CartItems)
            .ThenInclude(x => x.Product)
            .ThenInclude(x => x!.Inventories)
            .FirstAsync(x => x.Id == cartId);

        var items = cart.CartItems
            .Where(x => x.Product != null)
            .Select(x =>
            {
                var availableStock = x.Product!.Inventories.Sum(i => i.Quantity);
                var unitPrice = x.Product.Price;

                return new CartItemDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    ProductImageUrl = x.Product.ImageUrl,
                    UnitPrice = unitPrice,
                    Quantity = x.Quantity,
                    TotalPrice = unitPrice * x.Quantity,
                    RequiresPrescription = x.Product.RequiresPrescription,
                    AvailableStock = availableStock
                };
            })
            .ToList();

        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = items,
            TotalItems = items.Sum(x => x.Quantity),
            TotalAmount = items.Sum(x => x.TotalPrice),
            HasPrescriptionRequiredItems = items.Any(x => x.RequiresPrescription)
        };
    }
}