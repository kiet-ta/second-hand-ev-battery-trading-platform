using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class SellerDashboardDto
    {
        public int Listings { get; set; }
        public int Orders { get; set; }
        public int Sold { get; set; }
        public decimal Revenue { get; set; }

        public ProductStatisticsDto ProductStatistics { get; set; }
        public OrderStatisticsDto OrderStatistics { get; set; }
        public List<RevenueByMonthDto> RevenueByMonth { get; set; }
        public List<OrdersByMonthDto> OrdersByMonth { get; set; }
    }
}
