using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common.Constants
{
    public enum PaymentStatus
    {
        Pending,
        Completed, Failed, Refunded, Expired
    }
}
