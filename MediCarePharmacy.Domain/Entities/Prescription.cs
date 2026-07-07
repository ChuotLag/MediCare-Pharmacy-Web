using MediCarePharmacy.Domain.Common;
using MediCarePharmacy.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class Prescription : BaseEntity
    {
        public Guid UserId { get; set; }

        public Guid? OrderId { get; set; }

        public string FileUrl { get; set; } = string.Empty;

        public string OriginalFileName { get; set; } = string.Empty;

        public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Pending;

        public string? AdminNote { get; set; }

        public Guid? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public User? User { get; set; }

        public Order? Order { get; set; }

        public User? Reviewer { get; set; }
    }
}
