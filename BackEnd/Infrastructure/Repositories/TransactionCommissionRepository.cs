using Application.IRepositories;
using Domain.Entities;
using Google;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
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

        public async Task<TransactionCommission> GetTransactionCommissionByOrderId(int orderId)
        {
            var payment = await _context.PaymentDetails
                .FirstOrDefaultAsync(pd => pd.OrderId == orderId);
            var wallet = await _context.WalletTransactions
                .FirstOrDefaultAsync(w => w.OrderId == orderId);
            if (payment != null)
            {
                var transactions = await _context.TransactionCommissions
                    .FirstOrDefaultAsync(tc => tc.PaymentTransactionId == payment.PaymentDetailId);
                return transactions;
            }
            else if (wallet != null)
            {
                var transactions = await _context.TransactionCommissions
                    .FirstOrDefaultAsync(tc => tc.WalletTransactionId == wallet.TransactionId);
                return transactions;
            }
            else
                throw new Exception("No transaction found");

        }
    }
}
