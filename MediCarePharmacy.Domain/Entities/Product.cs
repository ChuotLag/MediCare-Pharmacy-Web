using MediCarePharmacy.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class Product : BaseEntity
    {
        public Guid CategoryId { get; set; }

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

        public bool RequiresPrescription { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public Category? Category { get; set; }

        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
