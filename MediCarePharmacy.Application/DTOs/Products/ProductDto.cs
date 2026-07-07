using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Products
{
    public class ProductDto
    {
        public Guid Id { get; set; }

        public Guid CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Ingredients { get; set; }

        public string? UsageInstructions { get; set; }

        public string? Contraindications { get; set; }

        public string? Manufacturer { get; set; }

        public string? Origin { get; set; }

        public string Unit { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public bool RequiresPrescription { get; set; }

        public bool IsActive { get; set; }

        public int TotalStock { get; set; }
    }
}
