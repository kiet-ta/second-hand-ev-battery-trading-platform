using Application.DTOs.ManageCompanyDto;
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

        public async Task<List<SellerPendingApprovalDto>> GetPendingApprovalsAsync()
        {
            // AsNoTracking cho read-only, tránh N+1 bằng subquery FirstOrDefault cho address
            var query = _context.KycDocuments
                .AsNoTracking()
                .Where(k => k.Status == "pending")
                .Join(
                    _context.Users.AsNoTracking(),
                    k => k.UserId,
                    u => u.UserId,
                    (k, u) => new { Kyc = k, User = u }
                )
                .Select(x => new
                {
                    x.Kyc,
                    x.User,
                    PreferredAddress = _context.Addresses
                        .AsNoTracking()
                        .Where(a => a.UserId == x.User.UserId && !a.IsDeleted)
                        // ưu tiên: is_shop_address -> is_default -> fallback smallest id
                        .OrderByDescending(a => a.IsShopAddress)
                        .ThenByDescending(a => a.IsDefault)
                        .ThenBy(a => a.AddressId)
                        .FirstOrDefault()
                })
                .OrderByDescending(x => x.Kyc.SubmittedAt)
                .Select(x => new SellerPendingApprovalDto
                {
                    Id = x.Kyc.DocId,
                    Seller = x.User.FullName,
                    Region = x.PreferredAddress != null ? (x.PreferredAddress.Province ?? string.Empty) : string.Empty,
                    SubmittedAt = x.Kyc.SubmittedAt
                });

            return await query.ToListAsync();
        }

        public async Task<List<KycDocument>> GetPendingDocumentsAsync()
        {
            return await _context.KycDocuments
                .AsNoTracking()
                .Where(k => k.Status == "pending")
                .ToListAsync();
        }

        public async Task<KycDocument?> GetKycByIdAsync(int id)
        {
            return await _context.KycDocuments
                .FirstOrDefaultAsync(k => k.DocId == id);
        }

        public async Task UpdateAsync(KycDocument doc)
        {
            _context.KycDocuments.Update(doc);
            await _context.SaveChangesAsync();
        }
    }
}
