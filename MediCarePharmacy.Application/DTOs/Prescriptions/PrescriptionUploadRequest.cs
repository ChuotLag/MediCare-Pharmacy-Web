using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace MediCarePharmacy.Application.DTOs.Prescriptions
{
    public class PrescriptionUploadRequest
    {
        public IFormFile File { get; set; } = null!;

        public Guid? OrderId { get; set; }
    }
}
