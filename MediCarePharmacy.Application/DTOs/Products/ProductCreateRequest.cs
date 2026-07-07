using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Products
{
    public class ProductCreateRequest
    {
        [Required(ErrorMessage = "Category is required")]
        public Guid CategoryId { get; set; }

        [Required(ErrorMessage = "Product name is required")]
        [MaxLength(200, ErrorMessage = "Product name cannot exceed 200 characters")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Ingredients { get; set; }

        public string? UsageInstructions { get; set; }

        public string? Contraindications { get; set; }

        [MaxLength(200, ErrorMessage = "Manufacturer cannot exceed 200 characters")]
        public string? Manufacturer { get; set; }

        [MaxLength(100, ErrorMessage = "Origin cannot exceed 100 characters")]
        public string? Origin { get; set; }

        [Required(ErrorMessage = "Unit is required")]
        [MaxLength(50, ErrorMessage = "Unit cannot exceed 50 characters")]
        public string Unit { get; set; } = string.Empty;

        [Range(1, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string? ImageUrl { get; set; }

        public bool RequiresPrescription { get; set; }
    }
}
