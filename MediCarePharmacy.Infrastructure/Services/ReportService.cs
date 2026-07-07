using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Reports;
using MediCarePharmacy.Application.Interfaces;
using MediCarePharmacy.Domain.Enums;
using MediCarePharmacy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MediCarePharmacy.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync()
    {
        var today = DateTime.UtcNow.Date;
        var nearExpiryDate = today.AddDays(60);

        var totalOrders = await _context.Orders.CountAsync();

        var totalRevenue = await _context.Orders
            .Where(x => x.Status == OrderStatus.Completed)
            .SumAsync(x => x.TotalAmount);

        var pendingOrders = await _context.Orders
            .CountAsync(x => x.Status == OrderStatus.Pending);

        var completedOrders = await _context.Orders
            .CountAsync(x => x.Status == OrderStatus.Completed);

        var cancelledOrders = await _context.Orders
            .CountAsync(x => x.Status == OrderStatus.Cancelled);

        var lowStockItems = await _context.Inventories
            .CountAsync(x => x.Quantity <= x.LowStockThreshold);

        var nearExpiryItems = await _context.Inventories
            .CountAsync(x =>
                x.ExpiryDate.Date >= today &&
                x.ExpiryDate.Date <= nearExpiryDate
            );

        var totalCustomers = await _context.Users
            .CountAsync(x => x.Role == UserRole.Customer);

        var totalProducts = await _context.Products
            .CountAsync(x => x.IsActive);

        var totalPrescriptionsPending = await _context.Prescriptions
            .CountAsync(x => x.Status == PrescriptionStatus.Pending);

        var result = new DashboardSummaryDto
        {
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue,
            PendingOrders = pendingOrders,
            CompletedOrders = completedOrders,
            CancelledOrders = cancelledOrders,
            LowStockItems = lowStockItems,
            NearExpiryItems = nearExpiryItems,
            TotalCustomers = totalCustomers,
            TotalProducts = totalProducts,
            TotalPrescriptionsPending = totalPrescriptionsPending
        };

        return ApiResponse<DashboardSummaryDto>.Ok(result);
    }

    public async Task<ApiResponse<List<RevenueReportDto>>> GetRevenueReportAsync(
        RevenueQueryRequest request)
    {
        var fromDate = request.FromDate?.Date ?? DateTime.UtcNow.Date.AddDays(-30);
        var toDate = request.ToDate?.Date ?? DateTime.UtcNow.Date;

        if (fromDate > toDate)
        {
            return ApiResponse<List<RevenueReportDto>>.Fail("From date must be less than or equal to To date");
        }

        var revenueData = await _context.Orders
            .Where(x =>
                x.Status == OrderStatus.Completed &&
                x.CreatedAt.Date >= fromDate &&
                x.CreatedAt.Date <= toDate
            )
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => new RevenueReportDto
            {
                Date = g.Key,
                TotalOrders = g.Count(),
                TotalRevenue = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        return ApiResponse<List<RevenueReportDto>>.Ok(revenueData);
    }

    public async Task<ApiResponse<List<TopSellingProductDto>>> GetTopSellingProductsAsync(int top)
    {
        if (top <= 0)
        {
            top = 5;
        }

        if (top > 50)
        {
            top = 50;
        }

        var result = await _context.OrderItems
            .Where(x => x.Order != null && x.Order.Status == OrderStatus.Completed)
            .GroupBy(x => new
            {
                x.ProductId,
                x.ProductName
            })
            .Select(g => new TopSellingProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                TotalQuantitySold = g.Sum(x => x.Quantity),
                TotalRevenue = g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.TotalQuantitySold)
            .Take(top)
            .ToListAsync();

        return ApiResponse<List<TopSellingProductDto>>.Ok(result);
    }
}