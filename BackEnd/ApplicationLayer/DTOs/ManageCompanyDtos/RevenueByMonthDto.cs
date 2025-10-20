using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDtos
{
    public class RevenueByMonthDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
