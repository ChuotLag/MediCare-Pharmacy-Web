using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Orders
{
    public class CreateOrderRequest
    {
        [Required(ErrorMessage = "Customer name is required")]
        [MaxLength(150, ErrorMessage = "Customer name cannot exceed 150 characters")]
        public string CustomerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Customer phone is required")]
        [MaxLength(20, ErrorMessage = "Customer phone cannot exceed 20 characters")]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Shipping address is required")]
        [MaxLength(255, ErrorMessage = "Shipping address cannot exceed 255 characters")]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Payment method is required")]
        public string PaymentMethod { get; set; } = "COD";

        [MaxLength(500, ErrorMessage = "Note cannot exceed 500 characters")]
        public string? Note { get; set; }
    }
}
