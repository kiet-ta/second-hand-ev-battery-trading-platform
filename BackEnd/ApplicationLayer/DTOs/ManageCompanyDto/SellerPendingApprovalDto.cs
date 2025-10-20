using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDto
{
    public class SellerPendingApprovalDto
    {
        public int Id { get; set; }
        public string Seller { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
    }
}
