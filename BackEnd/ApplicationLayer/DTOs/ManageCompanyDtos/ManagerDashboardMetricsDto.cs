using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDtos
{
    public class ManagerDashboardMetricsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveListings { get; set; }
        public double ComplaintRate { get; set; }
        public double Growth { get; set; }
    }
}
