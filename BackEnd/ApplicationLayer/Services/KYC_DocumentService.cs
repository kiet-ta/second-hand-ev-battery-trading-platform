using Application.DTOs;
using Application.IRepositories;
using AutoMapper;
using Domain.Common.Constants;
using Domain.Entities;

namespace Application.Services
{
    public class KYC_DocumentService : IKYC_DocumentService
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;


        public KYC_DocumentService(IMapper mapper,  IUnitOfWork unitOfWork)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task BanUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == UserStatus.Ban.ToString())
                throw new InvalidOperationException("User is already banned");

            await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Ban.ToString());
        }

        public async Task ActivateUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == UserStatus.Active_UserStatus.ToString())
                throw new InvalidOperationException("User is already active");

            await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Active_UserStatus.ToString());
        }

        public async Task WarningUserAsync(int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            if (user.AccountStatus == UserStatus.Ban.ToString())
                throw new InvalidOperationException("Cannot warn a banned user");

            switch (user.AccountStatus)
            {
                case "Warning1":
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Warning2.ToString());
                    break;
                case "Warning2":
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Ban.ToString());
                    break;
                default:
                    await _unitOfWork.KycDocuments.UpdateAccountStatusAsync(user.UserId, UserStatus.Warning1.ToString());
                    break;
            }
        }

        public async Task ApproveKycAsync(int kycId, ApproveKyc_DocumentDTO dto)
        {
            var kycDoc = await _unitOfWork.KycDocuments.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _unitOfWork.KycDocuments.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

            await _unitOfWork.KycDocuments.UpdateKYC_StatusAsync(kycDoc.DocId, KycStatus.Approved_KycStatus.ToString(), dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

  
            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Approved_KycStatus.ToString(), UserRole.Seller.ToString());
        }

        public async Task RejectKycAsync(int kycId, ApproveKyc_DocumentDTO dto)
        {
            var kycDoc = await _unitOfWork.KycDocuments.GetKYC_DocumentByIdAsync(kycId)
                        ?? throw new ArgumentException("KYC document not found");

            var user = await _unitOfWork.KycDocuments.GetByIdAsync(kycDoc.UserId)
                       ?? throw new ArgumentException("User not found for this KYC document");

           

            await _unitOfWork.KycDocuments.UpdateKYC_StatusAsync(kycDoc.DocId, KycStatus.Rejected_KycStatus.ToString(), dto.Note ?? "");

            kycDoc.VerifiedAt = dto.VerifiedAt ?? DateTime.Now;
            kycDoc.VerifiedBy = dto.VerifiedBy;

            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Rejected_KycStatus.ToString(),UserRole.Buyer.ToString());

        }

        private async Task SetUserKycPendingAsync(User user)
        {
            await _unitOfWork.KycDocuments.SetUserKYCStatusAsync(user.UserId, KycStatus.Pending_KycStatus.ToString(), UserRole.Seller.ToString());
        }

        public async Task<IEnumerable<KycDocument>> GetPendingKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Pending_KycStatus.ToString());

        public async Task<IEnumerable<KycDocument>> GetApprovedKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Approved_KycStatus.ToString());

        public async Task<IEnumerable<KycDocument>> GetRejectedKycAsync()
            => await _unitOfWork.KycDocuments.GetKYC_DocumentsByStatusAsync(KycStatus.Rejected_KycStatus.ToString());

        public async Task CreateKycDocumentAsync(KycDocument kyc, int userId)
        {
            var user = await _unitOfWork.KycDocuments.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found");

            kyc.UserId = userId;
            kyc.SubmittedAt = DateTime.Now;
            kyc.Status = KycStatus.Pending_KycStatus.ToString();

            await _unitOfWork.KycDocuments.CreateKYC_DocumentAsync(kyc);
            await SetUserKycPendingAsync(user);
        }
    }
}
