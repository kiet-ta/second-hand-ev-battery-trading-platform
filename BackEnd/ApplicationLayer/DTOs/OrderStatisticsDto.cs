using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class OrderStatisticsDto
    {
        public int New { get; set; }
        public int Processing { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
    }
}
