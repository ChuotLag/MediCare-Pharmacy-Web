using MediCarePharmacy.Application.DTOs.Inventory;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/inventory")]
public class AdminInventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public AdminInventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] InventoryQueryRequest request)
    {
        var result = await _inventoryService.GetPagedAsync(request);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _inventoryService.GetByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProductId(Guid productId)
    {
        var result = await _inventoryService.GetByProductIdAsync(productId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(InventoryCreateRequest request)
    {
        var result = await _inventoryService.CreateAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, InventoryUpdateRequest request)
    {
        var result = await _inventoryService.UpdateAsync(id, request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _inventoryService.DeleteAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var result = await _inventoryService.GetLowStockAsync();
        return Ok(result);
    }

    [HttpGet("near-expiry")]
    public async Task<IActionResult> GetNearExpiry([FromQuery] int days = 60)
    {
        var result = await _inventoryService.GetNearExpiryAsync(days);
        return Ok(result);
    }
}