using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Cart
{
    public class CartDto
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public List<CartItemDto> Items { get; set; } = new();

        public int TotalItems { get; set; }

        public decimal TotalAmount { get; set; }

        public bool HasPrescriptionRequiredItems { get; set; }
    }
}
