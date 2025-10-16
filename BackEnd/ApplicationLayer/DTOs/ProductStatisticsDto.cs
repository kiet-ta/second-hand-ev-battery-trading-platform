using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ProductStatisticsDto
    {
        public int Active { get; set; }
        public int Pending { get; set; }
        public int Inactive { get; set; }
        public int Featured { get; set; }
    }
}
