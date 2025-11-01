using Application.DTOs;
using Domain.Entities;

public interface IKYC_DocumentService
{
    Task BanUserAsync(int userId);
    Task ActivateUserAsync(int userId);
    Task WarningUserAsync(int userId);

    Task ApproveKycAsync(int kycId, ApproveKyc_DocumentDTO dto);
    Task RejectKycAsync(int kycId, ApproveKyc_DocumentDTO dto);

    Task<IEnumerable<KycDocument>> GetPendingKycAsync();
    Task<IEnumerable<KycDocument>> GetApprovedKycAsync();
    Task<IEnumerable<KycDocument>> GetRejectedKycAsync();

    Task CreateKycDocumentAsync(KycDocument kyc, int userId);
}
