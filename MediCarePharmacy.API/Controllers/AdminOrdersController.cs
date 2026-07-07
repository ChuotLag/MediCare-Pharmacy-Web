using MediCarePharmacy.Application.DTOs.Orders;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] OrderQueryRequest request)
    {
        var result = await _orderService.GetAllOrdersAsync(request);

        return Ok(result);
    }

    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> GetOrderById(Guid orderId)
    {
        var result = await _orderService.GetOrderByIdForAdminAsync(orderId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("{orderId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid orderId,
        UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateOrderStatusAsync(orderId, request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}