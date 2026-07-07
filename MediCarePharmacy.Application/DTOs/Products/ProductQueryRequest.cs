using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Products
{
    public class ProductQueryRequest
    {
        public string? Keyword { get; set; }

        public Guid? CategoryId { get; set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 12;

        public string? SortBy { get; set; }
    }
}
