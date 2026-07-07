using MediCarePharmacy.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class Inventory : BaseEntity
    {
        public Guid ProductId { get; set; }

        public string BatchNumber { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public decimal ImportPrice { get; set; }

        public decimal SellingPrice { get; set; }

        public DateTime? ManufactureDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public int LowStockThreshold { get; set; } = 10;

        public Product? Product { get; set; }
    }
}
