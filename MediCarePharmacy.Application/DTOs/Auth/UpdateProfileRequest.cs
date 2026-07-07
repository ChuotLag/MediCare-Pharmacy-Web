using System.ComponentModel.DataAnnotations;

namespace MediCarePharmacy.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }
}