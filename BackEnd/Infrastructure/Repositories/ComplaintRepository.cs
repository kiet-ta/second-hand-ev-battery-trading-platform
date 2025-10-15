using Application.IRepositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ComplaintRepository : IComplaintRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ComplaintRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<double> GetComplaintRateAsync()
        {
            var totalSellers = await _context.Users.CountAsync(u => u.Role == "seller" && u.IsDeleted == false);
            var sellersWithComplaints = await _context.Complaints
                .Select(c => c.SellerId)
                .Distinct()
                .CountAsync();

            return totalSellers == 0 ? 0 : Math.Round((double)sellersWithComplaints / totalSellers * 100, 2);
        }
    }
}
