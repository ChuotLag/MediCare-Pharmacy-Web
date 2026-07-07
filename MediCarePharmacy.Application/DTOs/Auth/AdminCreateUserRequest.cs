using System.ComponentModel.DataAnnotations;
using MediCarePharmacy.Domain.Enums;

namespace MediCarePharmacy.Application.DTOs.Auth;

public class AdminCreateUserRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }

    [Required]
    public string Role { get; set; } = "Customer";
}