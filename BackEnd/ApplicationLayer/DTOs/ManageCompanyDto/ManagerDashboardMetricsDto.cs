using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManagerDto
{
    public class ManagerDashboardMetricsDto
    {
        public decimal RevenueThisMonth { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveListings { get; set; }
        public double ComplaintRate { get; set; }
        public double Growth { get; set; }
    }
}
