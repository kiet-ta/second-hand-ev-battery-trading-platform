using Application.DTOs;
using Application.IRepositories;
using AutoMapper;
using Domain.Entities;

namespace Application.Services
{
    public class KYC_DocumentService : IKYC_DocumentService
    {
        private readonly IKYC_DocumentRepository _kycRepo;
        private readonly IMapper _mapper;

        public KYC_DocumentService(IMapper mapper, IKYC_DocumentRepository kycRepo)
        {
            _kycRepo = kycRepo;
            _mapper = mapper;
        }

        public async Task BanUserAsync(int userId)
        {
            var user = await _kycRepo.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == "ban")
                throw new InvalidOperationException("User is already banned");

            await _kycRepo.UpdateAccountStatusAsync(user.UserId, "ban");
        }

        public async Task ActivateUserAsync(int userId)
        {
            var user = await _kycRepo.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == "active")
                throw new InvalidOperationException("User is already active");

            await _kycRepo.UpdateAccountStatusAsync(user.UserId, "active");
        }

        public async Task WarningUserAsync(int userId)
        {
            var user = await _kycRepo.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == "ban")
                throw new InvalidOperationException("Cannot warn a banned user");

            switch (user.AccountStatus)
            {
                case "warning1":
                    await _kycRepo.UpdateAccountStatusAsync(user.UserId, "warning2");
                    break;
                case "warning2":
                    await _kycRepo.UpdateAccountStatusAsync(user.UserId, "ban");
                    break;
                default:
                    await _kycRepo.UpdateAccountStatusAsync(user.UserId, "warning1");
                    break;
            }
        }

        public async Task ApproveKycAsync(int kycId, ApproveKyc_DocumentDTO dto)
        {
            var kycDoc = await _kycRepo.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _kycRepo.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

            await _kycRepo.UpdateKYC_StatusAsync(kycDoc.DocId, "approved", dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

  
            await _kycRepo.SetUserKYCStatusAsync(user.UserId, "approved", "seller");
        }

        public async Task RejectKycAsync(int kycId, ApproveKyc_DocumentDTO dto)
        {
            var kycDoc = await _kycRepo.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _kycRepo.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

           

            await _kycRepo.UpdateKYC_StatusAsync(kycDoc.DocId, "rejected", dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

            await _kycRepo.SetUserKYCStatusAsync(user.UserId, "rejected", "buyer");

        }

        private async Task SetUserKycPendingAsync(User user)
        {
            await _kycRepo.SetUserKYCStatusAsync(user.UserId, "pending", "buyer");
        }

        public async Task<IEnumerable<KycDocument>> GetPendingKycAsync()
            => await _kycRepo.GetKYC_DocumentsByStatusAsync("pending");

        public async Task<IEnumerable<KycDocument>> GetApprovedKycAsync()
            => await _kycRepo.GetKYC_DocumentsByStatusAsync("approved");

        public async Task<IEnumerable<KycDocument>> GetRejectedKycAsync()
            => await _kycRepo.GetKYC_DocumentsByStatusAsync("rejected");

        public async Task CreateKycDocumentAsync(KycDocument kyc, int userId)
        {
            var user = await _kycRepo.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            kyc.UserId = userId;
            kyc.SubmittedAt = DateTime.Now;
            kyc.Status = "pending";

            await _kycRepo.CreateKYC_DocumentAsync(kyc);
            await SetUserKycPendingAsync(user);
        }
    }
}
