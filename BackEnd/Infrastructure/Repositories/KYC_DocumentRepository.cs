using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Runtime.ConstrainedExecution;


namespace Infrastructure.Repositories
{
    public class KYC_DocumentRepository : IKYC_DocumentRepository
    {
        private readonly EvBatteryTradingContext _context;

        public KYC_DocumentRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        // ----------------- USER MANAGEMENT -----------------
        public async Task<User?> GetByIdAsync(int id)
        {
            var user = await _context.Users
    .FirstOrDefaultAsync(u => u.UserId == id && !(u.IsDeleted == true));
            return user;
        }

        public async Task UpdateAccountStatusAsync(int id, string status)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return;

            user.AccountStatus = status; // active, banned, warning1, warning2

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task SetUserKYCStatusAsync(int id, string status)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) throw new Exception($"User {id} not found");
            user.KycStatus = status;
            // not_submitted, pending, approved, rejected

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        // ----------------- KYC DOCUMENT -----------------
        public async Task CreateKYC_DocumentAsync(KycDocument kyc)
        {
            await _context.KycDocuments.AddAsync(kyc);
            await _context.SaveChangesAsync();
        }

        public async Task<KycDocument?> GetKYC_DocumentByIdAsync(int id)
        {
            return await _context.KycDocuments
                .FirstOrDefaultAsync(k => k.DocId == id);
        }

        public async Task UpdateKYC_StatusAsync(int id, string status, string note)
        {
            var kyc = await _context.KycDocuments.FindAsync(id);
            if (kyc == null) return;

            kyc.Status = status; // pending, approved, rejected
            kyc.Note = note;
            _context.KycDocuments.Update(kyc);
            await _context.SaveChangesAsync();
        }

        // ----------------- QUERY LIST -----------------
        public async Task<IEnumerable<KycDocument>> GetKYC_DocumentsByStatusAsync(string status)
        {
            return await _context.KycDocuments
                .Where(k => k.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<KycDocument>> GetAllKYC_DocumentsAsync()
        {
            return await _context.KycDocuments.ToListAsync();
        }
    }
}
