using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Complaint
{
    public int ComplaintId { get; set; }

    public int OrderId { get; set; }

    public int FiledBy { get; set; }

    public string? Content { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ExternalUser FiledByNavigation { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
