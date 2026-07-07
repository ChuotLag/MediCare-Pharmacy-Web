using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.DTOs.Reports
{
    public class DashboardSummaryDto
    {
        public int TotalOrders { get; set; }

        public decimal TotalRevenue { get; set; }

        public int PendingOrders { get; set; }

        public int CompletedOrders { get; set; }

        public int CancelledOrders { get; set; }

        public int LowStockItems { get; set; }

        public int NearExpiryItems { get; set; }

        public int TotalCustomers { get; set; }

        public int TotalProducts { get; set; }

        public int TotalPrescriptionsPending { get; set; }
    }
}
