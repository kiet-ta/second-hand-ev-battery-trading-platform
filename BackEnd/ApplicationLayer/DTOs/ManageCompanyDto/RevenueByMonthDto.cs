using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManagerDto
{
    public class RevenueByMonthDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
