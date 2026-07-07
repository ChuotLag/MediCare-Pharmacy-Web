using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Orders;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Entities;
using MediCarePharmacy.Domain.Enums;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<OrderDto>> CreateOrderAsync(Guid userId, CreateOrderRequest request)
    {
        var validationError = ValidateCreateOrderRequest(request);

        if (validationError != null)
        {
            return ApiResponse<OrderDto>.Fail(validationError);
        }

        var paymentMethod = ParsePaymentMethod(request.PaymentMethod);

        if (paymentMethod == null)
        {
            return ApiResponse<OrderDto>.Fail("Invalid payment method");
        }

        var cart = await _context.Carts
            .Include(x => x.CartItems)
            .ThenInclude(x => x.Product)
            .ThenInclude(x => x!.Inventories)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cart == null || !cart.CartItems.Any())
        {
            return ApiResponse<OrderDto>.Fail("Cart is empty");
        }

        foreach (var cartItem in cart.CartItems)
        {
            if (cartItem.Product == null || !cartItem.Product.IsActive)
            {
                return ApiResponse<OrderDto>.Fail("Some products are not available");
            }

            var availableStock = cartItem.Product.Inventories.Sum(x => x.Quantity);

            if (cartItem.Quantity > availableStock)
            {
                return ApiResponse<OrderDto>.Fail(
                    $"Product {cartItem.Product.Name} only has {availableStock} items in stock"
                );
            }
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var order = new Order
            {
                UserId = userId,
                OrderCode = await GenerateOrderCodeAsync(),
                CustomerName = request.CustomerName.Trim(),
                CustomerPhone = request.CustomerPhone.Trim(),
                ShippingAddress = request.ShippingAddress.Trim(),
                PaymentMethod = paymentMethod.Value,
                PaymentStatus = PaymentStatus.Unpaid,
                Status = OrderStatus.Pending,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            foreach (var cartItem in cart.CartItems)
            {
                var product = cartItem.Product!;

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Quantity = cartItem.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = product.Price * cartItem.Quantity,
                    CreatedAt = DateTime.UtcNow
                };

                totalAmount += orderItem.TotalPrice;

                order.OrderItems.Add(orderItem);

                await DeductInventoryAsync(product.Id, cartItem.Quantity);
            }

            order.TotalAmount = totalAmount;

            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = totalAmount,
                PaymentMethod = paymentMethod.Value,
                PaymentStatus = PaymentStatus.Unpaid,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Orders.AddAsync(order);
            await _context.Payments.AddAsync(payment);

            _context.CartItems.RemoveRange(cart.CartItems);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var createdOrder = await GetOrderEntityByIdAsync(order.Id);

            return ApiResponse<OrderDto>.Ok(
                MapToDto(createdOrder!),
                "Order created successfully"
            );
        }
        catch
        {
            await transaction.RollbackAsync();
            return ApiResponse<OrderDto>.Fail("Failed to create order");
        }
    }

    public async Task<ApiResponse<PagedResult<OrderDto>>> GetMyOrdersAsync(
        Guid userId,
        OrderQueryRequest request)
    {
        var query = _context.Orders
            .Include(x => x.OrderItems)
            .Where(x => x.UserId == userId)
            .AsQueryable();

        query = ApplyOrderFilters(query, request);

        var result = await BuildPagedOrderResultAsync(query, request);

        return ApiResponse<PagedResult<OrderDto>>.Ok(result);
    }

    public async Task<ApiResponse<OrderDto>> GetMyOrderByIdAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == userId);

        if (order == null)
        {
            return ApiResponse<OrderDto>.Fail("Order not found");
        }

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<bool>> CancelMyOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == userId);

        if (order == null)
        {
            return ApiResponse<bool>.Fail("Order not found");
        }

        if (order.Status != OrderStatus.Pending)
        {
            return ApiResponse<bool>.Fail("Only pending orders can be cancelled");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            foreach (var item in order.OrderItems)
            {
                await RestoreInventoryAsync(item.ProductId, item.Quantity);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<bool>.Ok(true, "Order cancelled successfully");
        }
        catch
        {
            await transaction.RollbackAsync();
            return ApiResponse<bool>.Fail("Failed to cancel order");
        }
    }

    public async Task<ApiResponse<PagedResult<OrderDto>>> GetAllOrdersAsync(OrderQueryRequest request)
    {
        var query = _context.Orders
            .Include(x => x.OrderItems)
            .AsQueryable();

        query = ApplyOrderFilters(query, request);

        var result = await BuildPagedOrderResultAsync(query, request);

        return ApiResponse<PagedResult<OrderDto>>.Ok(result);
    }

    public async Task<ApiResponse<OrderDto>> GetOrderByIdForAdminAsync(Guid orderId)
    {
        var order = await _context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == orderId);

        if (order == null)
        {
            return ApiResponse<OrderDto>.Fail("Order not found");
        }

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(
        Guid orderId,
        UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == orderId);

        if (order == null)
        {
            return ApiResponse<OrderDto>.Fail("Order not found");
        }

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
        {
            return ApiResponse<OrderDto>.Fail("Invalid order status");
        }

        if (order.Status == OrderStatus.Cancelled)
        {
            return ApiResponse<OrderDto>.Fail("Cancelled order cannot be updated");
        }

        if (newStatus == OrderStatus.Cancelled)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                order.Status = OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;

                foreach (var item in order.OrderItems)
                {
                    await RestoreInventoryAsync(item.ProductId, item.Quantity);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ApiResponse<OrderDto>.Ok(MapToDto(order), "Order cancelled successfully");
            }
            catch
            {
                await transaction.RollbackAsync();
                return ApiResponse<OrderDto>.Fail("Failed to cancel order");
            }
        }

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (newStatus == OrderStatus.Completed && order.PaymentMethod == PaymentMethod.COD)
        {
            order.PaymentStatus = PaymentStatus.Paid;

            var payment = await _context.Payments.FirstOrDefaultAsync(x => x.OrderId == order.Id);

            if (payment != null)
            {
                payment.PaymentStatus = PaymentStatus.Paid;
                payment.PaidAt = DateTime.UtcNow;
                payment.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order), "Order status updated successfully");
    }

    private static string? ValidateCreateOrderRequest(CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
        {
            return "Customer name is required";
        }

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            return "Customer phone is required";
        }

        if (string.IsNullOrWhiteSpace(request.ShippingAddress))
        {
            return "Shipping address is required";
        }

        return null;
    }

    private static PaymentMethod? ParsePaymentMethod(string paymentMethod)
    {
        if (Enum.TryParse<PaymentMethod>(paymentMethod, true, out var result))
        {
            return result;
        }

        return null;
    }

    private async Task<string> GenerateOrderCodeAsync()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"ORD-{today}-";

        var countToday = await _context.Orders
            .CountAsync(x => x.OrderCode.StartsWith(prefix));

        return $"{prefix}{countToday + 1:0000}";
    }

    private async Task DeductInventoryAsync(Guid productId, int quantity)
    {
        var inventories = await _context.Inventories
            .Where(x => x.ProductId == productId && x.Quantity > 0)
            .OrderBy(x => x.ExpiryDate)
            .ToListAsync();

        var remaining = quantity;

        foreach (var inventory in inventories)
        {
            if (remaining <= 0)
            {
                break;
            }

            var deductQuantity = Math.Min(inventory.Quantity, remaining);

            inventory.Quantity -= deductQuantity;
            inventory.UpdatedAt = DateTime.UtcNow;

            remaining -= deductQuantity;
        }

        if (remaining > 0)
        {
            throw new InvalidOperationException("Not enough stock");
        }
    }

    private async Task RestoreInventoryAsync(Guid productId, int quantity)
    {
        var inventory = await _context.Inventories
            .Where(x => x.ProductId == productId)
            .OrderBy(x => x.ExpiryDate)
            .FirstOrDefaultAsync();

        if (inventory == null)
        {
            return;
        }

        inventory.Quantity += quantity;
        inventory.UpdatedAt = DateTime.UtcNow;
    }

    private IQueryable<Order> ApplyOrderFilters(IQueryable<Order> query, OrderQueryRequest request)
    {
        if (request.Page <= 0)
        {
            request.Page = 1;
        }

        if (request.PageSize <= 0)
        {
            request.PageSize = 10;
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();

            query = query.Where(x =>
                x.OrderCode.ToLower().Contains(keyword) ||
                x.CustomerName.ToLower().Contains(keyword) ||
                x.CustomerPhone.ToLower().Contains(keyword)
            );
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            {
                query = query.Where(x => x.Status == status);
            }
        }

        return query.OrderByDescending(x => x.CreatedAt);
    }

    private async Task<PagedResult<OrderDto>> BuildPagedOrderResultAsync(
        IQueryable<Order> query,
        OrderQueryRequest request)
    {
        var totalItems = await query.CountAsync();

        var orders = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedResult<OrderDto>
        {
            Items = orders.Select(MapToDto).ToList(),
            Page = request.Page,
            PageSize = request.PageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)request.PageSize)
        };
    }

    private async Task<Order?> GetOrderEntityByIdAsync(Guid orderId)
    {
        return await _context.Orders
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == orderId);
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            UserId = order.UserId,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            ShippingAddress = order.ShippingAddress,
            TotalAmount = order.TotalAmount,
            Status = order.Status.ToString(),
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            Note = order.Note,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(x => new OrderItemDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Quantity = x.Quantity,
                UnitPrice = x.UnitPrice,
                TotalPrice = x.TotalPrice
            }).ToList()
        };
    }
}