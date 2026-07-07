using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Orders
{
    public class UpdateOrderStatusRequest
    {
        [Required(ErrorMessage = "Order status is required")]
        public string Status { get; set; } = string.Empty;
    }
}
