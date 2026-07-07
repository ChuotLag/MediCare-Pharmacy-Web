using MediCarePharmacy.Application.DTOs.Products;
using MediCarePharmacy.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] ProductQueryRequest request)
    {
        var result = await _productService.GetPagedAsync(request, false);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _productService.GetByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _productService.GetBySlugAsync(slug);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}