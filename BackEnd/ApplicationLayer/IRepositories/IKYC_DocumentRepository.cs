using Application.DTOs.ManageCompanyDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IKYC_DocumentRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task UpdateAccountStatusAsync(int id, string status);
        Task SetUserKYCStatusAsync(int id, string status, string role);

        Task CreateKYC_DocumentAsync(KycDocument kyc);
        Task<KycDocument?> GetKYC_DocumentByIdAsync(int id);
        Task UpdateKYC_StatusAsync(int id, string status, string note);

       
        Task<IEnumerable<KycDocument>> GetKYC_DocumentsByStatusAsync(string status);
        Task<IEnumerable<KycDocument>> GetAllKYC_DocumentsAsync();
        Task<List<SellerPendingApprovalDto>> GetPendingApprovalsAsync();
        Task<List<KycDocument>> GetPendingDocumentsAsync();
        Task<KycDocument?> GetKycByIdAsync(int id);
        Task UpdateAsync(KycDocument doc);
    }
}
