namespace MediCarePharmacy.Application.DTOs.Cart;

public class CartItemDto
{
    public Guid Id { get; set; }

    public Guid ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string? ProductImageUrl { get; set; }

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public decimal TotalPrice { get; set; }

    public bool RequiresPrescription { get; set; }

    public int AvailableStock { get; set; }
}