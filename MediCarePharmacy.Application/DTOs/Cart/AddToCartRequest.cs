using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Cart
{
    public class AddToCartRequest
    {
        [Required(ErrorMessage = "Product is required")]
        public Guid ProductId { get; set; }

        [Range(1, 999, ErrorMessage = "Quantity must be from 1 to 999")]
        public int Quantity { get; set; } = 1;
    }
}
