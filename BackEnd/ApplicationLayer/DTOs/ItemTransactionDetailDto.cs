using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ItemTransactionDetailDto
    {
        public int? OrderId { get; set; }
        public int? ItemId { get; set; }
        public decimal PaymentAmount { get; set; }
        public int Quantity { get; set; }
        public decimal ItemPrice { get; set; }
    }
}
