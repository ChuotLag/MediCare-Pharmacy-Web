using MediCarePharmacy.Application.DTOs.Reports;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public AdminReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("dashboard-summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var result = await _reportService.GetDashboardSummaryAsync();

        return Ok(result);
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenueReport([FromQuery] RevenueQueryRequest request)
    {
        var result = await _reportService.GetRevenueReportAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("top-selling-products")]
    public async Task<IActionResult> GetTopSellingProducts([FromQuery] int top = 5)
    {
        var result = await _reportService.GetTopSellingProductsAsync(top);

        return Ok(result);
    }
}