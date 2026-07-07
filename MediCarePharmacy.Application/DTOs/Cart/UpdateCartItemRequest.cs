using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Cart
{
    public class UpdateCartItemRequest
    {
        [Range(1, 999, ErrorMessage = "Quantity must be from 1 to 999")]
        public int Quantity { get; set; }
    }
}
