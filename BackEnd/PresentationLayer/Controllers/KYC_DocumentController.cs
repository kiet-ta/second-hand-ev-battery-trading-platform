using Application.DTOs;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/kyc-document")]   
    public class KYC_DocumentController : ControllerBase
    {
        private readonly IKycDocumentService _kycService;

        public KYC_DocumentController(IKycDocumentService kycService)
        {
            _kycService = kycService;
        }

        [HttpPut("users/{userId}/ban")]
        public async Task<IActionResult> BanUser(int userId)
        {
            
                await _kycService.BanUserAsync(userId);
                return Ok(new { message = "User banned successfully" });
            
            
        }

        [HttpPut("users/{userId}/activate")]
        public async Task<IActionResult> ActivateUser(int userId)
        {
           
                await _kycService.ActivateUserAsync(userId);
                return Ok(new { message = "User activated successfully" });
           
        }

        [HttpPut("users/{userId}/warn")]
        public async Task<IActionResult> WarnUser(int userId)
        {
           
                await _kycService.WarningUserAsync(userId);
                return Ok(new { message = "User warned successfully" });
           
        }

        [HttpPut("kyc/{kycId}/approve")]
        public async Task<IActionResult> ApproveKyc(int kycId, [FromBody] ApproveKycDocumentDto dto)
        {
                if (dto == null || dto.VerifiedBy == null)
                    return BadRequest(new { error = "Missing verification info" });

                await _kycService.ApproveKycAsync(kycId, dto);
                return Ok(new { message = "KYC approved successfully" });
          
        }

        [HttpPut("kyc/{kycId}/reject")]
        public async Task<IActionResult> RejectKyc(int kycId, [FromBody] ApproveKycDocumentDto dto)
        {
           
                if (dto == null || dto.VerifiedBy == null)
                    return BadRequest(new { error = "Missing verification info" });

                await _kycService.RejectKycAsync(kycId, dto);
                return Ok(new { message = "KYC rejected successfully" });
           
        }

        [HttpGet("kyc/pending")]
        public async Task<IActionResult> GetPendingKyc()
        {
            var list = await _kycService.GetPendingKycAsync();
            return Ok(list);
        }

        [HttpGet("kyc/approved")]
        public async Task<IActionResult> GetApprovedKyc()
        {
            var list = await _kycService.GetApprovedKycAsync();
            return Ok(list);
        }

        [HttpGet("kyc/rejected")]
        public async Task<IActionResult> GetRejectedKyc()
        {
            var list = await _kycService.GetRejectedKycAsync();
            return Ok(list);
        }


        [HttpPost("users/{userId}/kyc")]
        public async Task<IActionResult> CreateKyc(int userId, [FromBody] CreateKycDocumentDto kycDto)
        {
            if (kycDto == null)
            {
                return BadRequest(new { error = "Invalid KYC data" });
            }

           
                var kyc = new KycDocument
                {
                    UserId = userId,
                    IdCardUrl = kycDto.IdCardUrl,
                    VehicleRegistrationUrl = kycDto.VehicleRegistrationUrl,
                    SelfieUrl = kycDto.SelfieUrl,
                    DocUrl = kycDto.DocUrl,
                    SubmittedAt = kycDto.SubmittedAt,
                    VerifiedBy = kycDto.VerifiedBy,
                    VerifiedAt = kycDto.VerifiedAt,
                    StoreName = kycDto.StoreName,
                    StorePhone = kycDto.StorePhone,
                    StoreLogoUrl = kycDto.StoreLogoUrl,
                    Status = KycStatus.Pending.ToString(),
                };

                await _kycService.CreateKycDocumentAsync(kyc, userId);

                return Ok(new { message = "KYC document created successfully" });
          
        }
    }
}
