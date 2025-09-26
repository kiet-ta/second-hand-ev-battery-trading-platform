using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class KycDocument
{
    public int DocId { get; set; }

    public int UserId { get; set; }

    public string? DocType { get; set; }

    public string? DocUrl { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public int? VerifiedBy { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public string? Status { get; set; }

    public string? Note { get; set; }

    public virtual ExternalUser User { get; set; } = null!;

    public virtual InternalUser? VerifiedByNavigation { get; set; }
}
