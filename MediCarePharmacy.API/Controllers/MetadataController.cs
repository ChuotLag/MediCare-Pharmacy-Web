using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetadataController : ControllerBase
{
    [HttpGet("order-statuses")]
    public IActionResult GetOrderStatuses()
    {
        return Ok(ApiResponse<string[]>.Ok(Enum.GetNames<OrderStatus>()));
    }

    [HttpGet("payment-methods")]
    public IActionResult GetPaymentMethods()
    {
        return Ok(ApiResponse<string[]>.Ok(Enum.GetNames<PaymentMethod>()));
    }

    [HttpGet("payment-statuses")]
    public IActionResult GetPaymentStatuses()
    {
        return Ok(ApiResponse<string[]>.Ok(Enum.GetNames<PaymentStatus>()));
    }

    [HttpGet("prescription-statuses")]
    public IActionResult GetPrescriptionStatuses()
    {
        return Ok(ApiResponse<string[]>.Ok(Enum.GetNames<PrescriptionStatus>()));
    }
}