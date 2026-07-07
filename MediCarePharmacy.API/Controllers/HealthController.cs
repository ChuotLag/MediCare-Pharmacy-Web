using MediCarePharmacy.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace MediCarePharmacy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new
        {
            message = "MediCare Pharmacy API is running",
            time = DateTime.UtcNow
        });
    }

    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabase()
    {
        var canConnect = await _context.Database.CanConnectAsync();

        return Ok(new
        {
            database = "MediCarePharmacyDb",
            canConnect
        });
    }
}