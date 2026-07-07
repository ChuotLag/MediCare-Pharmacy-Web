using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Prescriptions
{
    public class PrescriptionReviewRequest
    {
        public string Status { get; set; } = string.Empty;

        public string? AdminNote { get; set; }
    }
}
