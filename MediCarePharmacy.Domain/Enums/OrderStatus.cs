using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Domain.Enums
{
    public enum OrderStatus
    {
        Pending = 1,
        Confirmed = 2,
        Preparing = 3,
        Shipping = 4,
        Completed = 5,
        Cancelled = 6
    }
}
