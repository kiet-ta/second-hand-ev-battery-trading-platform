using Domain.Common.Constants;
using System;

namespace Application.DTOs
{
    public class CreateKYC_DocumentDTO
    {
        public int UserId { get; set; }

        public string? IdCardUrl { get; set; }
        public string? VehicleRegistrationUrl { get; set; }
        public string? SelfieUrl { get; set; }
        public string? DocUrl { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.Now;   
        public int? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; } = null;
        public string? StoreName { get; set; }
        public int? StorePhone { get; set; }
        public string? StoreLogoUrl { get; set; }
        public string Status { get; set; } = ComplaintStatus.Pending_ComplaintStatus.ToString();

    }
}
