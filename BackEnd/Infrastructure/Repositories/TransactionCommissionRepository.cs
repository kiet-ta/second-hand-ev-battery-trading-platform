using Application.IRepositories;
using Domain.Entities;
using Google;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class TransactionCommissionRepository : ITransactionCommissionRepository
    {
        private readonly EvBatteryTradingContext _context;

        public TransactionCommissionRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        // ... các phương thức khác ...

        // --- TRIỂN KHAI PHƯƠNG THỨC MỚI ---
        public async Task AddAsync(TransactionCommission commission)
        {
            await _context.TransactionCommissions.AddAsync(commission);
        }
    }
}
