using Application.DTOs;
using Application.IRepositories;
using AutoMapper;
using Domain.Common.Constants;
using Domain.Entities;

namespace Application.Services
{
    public class KycDocumentService : IKycDocumentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;


        public KycDocumentService(IMapper mapper,  IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task BanUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == "ban")
                throw new InvalidOperationException("User is already banned");

            await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, "ban");
        }

        public async Task ActivateUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == UserStatus.Active.ToString())
                throw new InvalidOperationException("User is already active");

            await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Active.ToString());
        }

        public async Task WarningUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == "ban")
                throw new InvalidOperationException("Cannot warn a banned user");

            switch (user.AccountStatus)
            {
                case "warning1":
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, "warning2");
                    break;
                case "warning2":
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, "ban");
                    break;
                default:
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, "warning1");
                    break;
            }
        }

        public async Task ApproveKycAsync(int kycId, ApproveKycDocumentDto dto)
        {
            var kycDoc = await _unitOfWork.KycDocuments.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _unitOfWork.KycDocuments.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

            await _unitOfWork.KycDocuments.UpdateKYC_StatusAsync(kycDoc.DocId, KycStatus.Approved.ToString(), dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

  
            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Approved.ToString(), UserRole.Seller.ToString());
        }

        public async Task RejectKycAsync(int kycId, ApproveKycDocumentDto dto)
        {
            var kycDoc = await _unitOfWork.KycDocuments.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _unitOfWork.KycDocuments.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

           

            await _unitOfWork.KycDocuments.UpdateKYC_StatusAsync(kycDoc.DocId, KycStatus.Rejected.ToString(), dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Rejected.ToString(),UserRole.Buyer.ToString());

        }

        private async Task SetUserKycPendingAsync(User user)
        {
            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Pending.ToString(), UserRole.Seller.ToString());
        }

        public async Task<IEnumerable<KycDocument>> GetPendingKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Pending.ToString());

        public async Task<IEnumerable<KycDocument>> GetApprovedKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Approved.ToString());

        public async Task<IEnumerable<KycDocument>> GetRejectedKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Rejected.ToString());

        public async Task CreateKycDocumentAsync(KycDocument kyc, int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            kyc.UserId = userId;
            kyc.SubmittedAt = DateTime.Now;
            kyc.Status = KycStatus.Pending.ToString();

            await _unitOfWork.KycDocuments.CreateKYC_DocumentAsync(kyc);
            await SetUserKycPendingAsync(user);
        }
    }
}
