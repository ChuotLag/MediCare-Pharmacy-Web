using MediCarePharmacy.Domain.Common;
using MediCarePharmacy.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Entities
{
    public class User : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer;

        public bool IsActive { get; set; } = true;

        public string? PasswordResetOtpHash { get; set; }

        public DateTime? PasswordResetOtpExpiresAt { get; set; }

        public int PasswordResetOtpAttempts { get; set; }

        public Cart? Cart { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}
