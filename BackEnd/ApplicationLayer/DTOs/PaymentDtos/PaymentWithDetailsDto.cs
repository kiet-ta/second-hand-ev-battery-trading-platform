using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.PaymentDtos
{
    public class PaymentWithDetailsDto
    {
        public int PaymentId { get; set; }
        public long OrderCode { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
        public string Method { get; set; }
        public string Status { get; set; }
        public string PaymentType { get; set; }
        public DateTime CreatedAt { get; set; }

        public IEnumerable<PaymentDetailDto> PaymentDetails { get; set; }
    }
}
