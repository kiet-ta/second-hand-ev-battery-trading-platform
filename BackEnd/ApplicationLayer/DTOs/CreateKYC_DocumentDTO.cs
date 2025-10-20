﻿using System;

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
        public string Status { get; set; } = "pending";

    }
}
