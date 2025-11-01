using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDtos
{
    public class LatestTransactionDto
    {
        public int PaymentId { get; set; }
        public string BuyerName { get; set; }
        public string SellerName { get; set; }
        public decimal TotalAmount { get; set; }
        public string Method { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<TransactionItemDto> Items { get; set; } = new();
    }
}
