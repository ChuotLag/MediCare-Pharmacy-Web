using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Reports;

namespace MediCarePharmacy.Application.Interfaces;

public interface IReportService
{
    Task<ApiResponse<DashboardSummaryDto>> GetDashboardSummaryAsync();

    Task<ApiResponse<List<RevenueReportDto>>> GetRevenueReportAsync(RevenueQueryRequest request);

    Task<ApiResponse<List<TopSellingProductDto>>> GetTopSellingProductsAsync(int top);
}