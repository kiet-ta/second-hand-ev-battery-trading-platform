using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ApproveKyc_DocumentDTO
    {
        public string? Note { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public int? VerifiedBy { get; set; }
        
    }
}
