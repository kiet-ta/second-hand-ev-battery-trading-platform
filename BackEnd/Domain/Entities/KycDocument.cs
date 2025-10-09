using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class KycDocument
{
    public int DocId { get; set; }

    public int UserId { get; set; }

    public string? IdCardUrl { get; set; }

    public string? VehicleRegistrationUrl { get; set; }

    public string? SelfieUrl { get; set; }

    public string? DocUrl { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public int? VerifiedBy { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public string? Status { get; set; }

    public string? Note { get; set; }

}
