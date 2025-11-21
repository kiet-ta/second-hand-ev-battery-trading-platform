using Application.DTOs;
using Domain.Entities;

public interface IKycDocumentService
{
    Task BanUserAsync(int userId);
    Task ActivateUserAsync(int userId);
    Task WarningUserAsync(int userId);

    Task ApproveKycAsync(int kycId, ApproveKycDocumentDto dto);
    Task RejectKycAsync(int kycId, ApproveKycDocumentDto dto);

    Task<IEnumerable<KycDocument>> GetPendingKycAsync();
    Task<IEnumerable<KycDocument>> GetApprovedKycAsync();
    Task<IEnumerable<KycDocument>> GetRejectedKycAsync();

    Task CreateKycDocumentAsync(KycDocument kyc, int userId);
}
