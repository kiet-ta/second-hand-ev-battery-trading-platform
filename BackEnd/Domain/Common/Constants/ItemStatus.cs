using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common.Constants
{
    public enum ItemStatus
    {
        Active, Auction_Active, Sold, Pending,
        Rejected, Pending_Pay, Auction_Pending_Pay
    }
}
