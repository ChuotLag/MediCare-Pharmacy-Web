namespace MediCarePharmacy.Application.DTOs.Prescriptions;

public class PrescriptionDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string UserFullName { get; set; } = string.Empty;

    public Guid? OrderId { get; set; }

    public string? OrderCode { get; set; }

    public string FileUrl { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? AdminNote { get; set; }

    public Guid? ReviewedBy { get; set; }

    public string? ReviewerName { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}