using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Reports
{
    public class TopSellingProductDto
    {
        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int TotalQuantitySold { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}
