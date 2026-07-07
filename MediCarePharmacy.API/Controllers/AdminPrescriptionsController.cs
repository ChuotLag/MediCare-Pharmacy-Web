using System.Security.Claims;
using MediCarePharmacy.Application.DTOs.Prescriptions;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/prescriptions")]
public class AdminPrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;

    public AdminPrescriptionsController(IPrescriptionService prescriptionService)
    {
        _prescriptionService = prescriptionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PrescriptionQueryRequest request)
    {
        var result = await _prescriptionService.GetAllAsync(request);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _prescriptionService.GetByIdForAdminAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("{id:guid}/review")]
    public async Task<IActionResult> Review(
        Guid id,
        PrescriptionReviewRequest request)
    {
        var adminId = GetCurrentUserId();

        if (adminId == null)
        {
            return Unauthorized();
        }

        var result = await _prescriptionService.ReviewAsync(
            id,
            adminId.Value,
            request
        );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            return null;
        }

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return null;
        }

        return userId;
    }
}