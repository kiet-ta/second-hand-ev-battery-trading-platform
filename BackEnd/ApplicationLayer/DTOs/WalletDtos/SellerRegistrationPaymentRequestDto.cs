using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.WalletDtos
{
    public class SellerRegistrationPaymentRequestDto
    {
        public int UserId { get; set; }
        public decimal RegistrationFeeAmount { get; set; }
        public string FeeCode { get; set; }
        public string? Description { get; set; }
    }
}
