using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class DetailedPaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public long OrderCode { get; set; }
        public int OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
        public string Method { get; set; }
        public string Status { get; set; }
        public string OrderStatus { get; set; }
        public DateTime CreatedAt { get; set; }

        public IEnumerable<ItemTransactionDetailDto> ItemDetails { get; set; }
    }
}
