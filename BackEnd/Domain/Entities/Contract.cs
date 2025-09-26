using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Contract
{
    public int ContractId { get; set; }

    public int OrderId { get; set; }

    public string? DocumentUrl { get; set; }

    public DateTime? SignedAt { get; set; }

    public virtual Order Order { get; set; } = null!;
}
