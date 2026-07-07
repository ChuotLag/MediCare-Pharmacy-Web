using MediCarePharmacy.Domain.Common;
using MediCarePharmacy.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public Guid OrderId { get; set; }

        public decimal Amount { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

        public string? TransactionCode { get; set; }

        public DateTime? PaidAt { get; set; }

        public Order? Order { get; set; }
    }
}
