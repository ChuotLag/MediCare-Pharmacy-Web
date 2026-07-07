using MediCarePharmacy.Domain.Common;
using MediCarePharmacy.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }

        public string OrderCode { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerPhone { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

        public string? Note { get; set; }

        public User? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();

        public Payment? Payment { get; set; }
    }
}
