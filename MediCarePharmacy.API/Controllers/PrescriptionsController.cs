using System.Security.Claims;
using MediCarePharmacy.Application.DTOs.Prescriptions;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer")]
[Route("api/[controller]")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;
    private readonly IWebHostEnvironment _environment;

    public PrescriptionsController(
        IPrescriptionService prescriptionService,
        IWebHostEnvironment environment)
    {
        _prescriptionService = prescriptionService;
        _environment = environment;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] PrescriptionUploadRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _prescriptionService.UploadAsync(
            userId.Value,
            request,
            _environment.WebRootPath
        );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("my-prescriptions")]
    public async Task<IActionResult> GetMyPrescriptions([FromQuery] PrescriptionQueryRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _prescriptionService.GetMyPrescriptionsAsync(
            userId.Value,
            request
        );

        return Ok(result);
    }

    [HttpGet("my-prescriptions/{id:guid}")]
    public async Task<IActionResult> GetMyPrescriptionById(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _prescriptionService.GetMyPrescriptionByIdAsync(
            userId.Value,
            id
        );

        if (!result.Success)
        {
            return NotFound(result);
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