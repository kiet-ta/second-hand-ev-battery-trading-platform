using Domain.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   
    public class KYC_DocumentController : ControllerBase
    {
        private readonly IKYC_DocumentService _kycService;

        public KYC_DocumentController(IKYC_DocumentService kycService)
        {
            _kycService = kycService;
        }

        // ================= 1. USER MANAGEMENT =================
        [HttpPut("users/{userId}/ban")]
        public async Task<IActionResult> BanUser(int userId)
        {
            try
            {
                await _kycService.BanUserAsync(userId);
                return Ok(new { message = "User banned successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("users/{userId}/activate")]
        public async Task<IActionResult> ActivateUser(int userId)
        {
            try
            {
                await _kycService.ActivateUserAsync(userId);
                return Ok(new { message = "User activated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("users/{userId}/warn")]
        public async Task<IActionResult> WarnUser(int userId)
        {
            try
            {
                await _kycService.WarningUserAsync(userId);
                return Ok(new { message = "User warned successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ================= 2. KYC MANAGEMENT =================
        [HttpPut("kyc/{kycId}/approve")]
        public async Task<IActionResult> ApproveKyc(int kycId, [FromBody] ApproveKyc_DocumentDTO dto)
        {
            try
            {
                if (dto == null || dto.VerifiedBy == null)
                    return BadRequest(new { error = "Missing verification info" });

                await _kycService.ApproveKycAsync(kycId, dto);
                return Ok(new { message = "KYC approved successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("kyc/{kycId}/reject")]
        public async Task<IActionResult> RejectKyc(int kycId, [FromBody] ApproveKyc_DocumentDTO dto)
        {
            try
            {
                if (dto == null || dto.VerifiedBy == null)
                    return BadRequest(new { error = "Missing verification info" });

                await _kycService.RejectKycAsync(kycId, dto);
                return Ok(new { message = "KYC rejected successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ================= 3. GET LISTS =================
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

        // ================= 4. CREATE =================
        [HttpPost("users/{userId}/kyc")]
        public async Task<IActionResult> CreateKyc(int userId, [FromBody] CreateKYC_DocumentDTO kycDto)
        {
            if (kycDto == null)
            {
                return BadRequest(new { error = "Invalid KYC data" });
            }

            try
            {
                var kyc = new KycDocument
                {
                    UserId = userId,
                    IdCardUrl = kycDto.IdCardUrl,
                    VehicleRegistrationUrl = kycDto.VehicleRegistrationUrl,
                    SelfieUrl = kycDto.SelfieUrl,
                    DocUrl = kycDto.DocUrl,
                    SubmittedAt = DateTime.Now,
                    VerifiedBy = null,
                    VerifiedAt = null,
                    Status = "pending",
                };

                await _kycService.CreateKycDocumentAsync(kyc, userId);

                return Ok(new { message = "KYC document created successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
