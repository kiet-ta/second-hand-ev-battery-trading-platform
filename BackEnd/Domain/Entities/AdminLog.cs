using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class AdminLog
{
    public int LogId { get; set; }

    public int AdminId { get; set; }

    public string? Action { get; set; }

    public string? Details { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual InternalUser Admin { get; set; } = null!;
}
