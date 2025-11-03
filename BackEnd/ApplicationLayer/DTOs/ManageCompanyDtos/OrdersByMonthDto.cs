using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDtos
{
    public class OrdersByMonthDto
    {
        public string Month { get; set; }
        public int TotalOrders { get; set; }
    }
}
