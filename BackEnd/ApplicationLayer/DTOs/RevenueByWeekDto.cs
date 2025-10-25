using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class RevenueByWeekDto
    {
        public int Year { get; set; }
        public int WeekNumber { get; set; }
        public decimal Total { get; set; }
    }
}
