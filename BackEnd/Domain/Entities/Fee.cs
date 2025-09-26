using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Fee
{
    public int FeeId { get; set; }

    public int OrderId { get; set; }

    public decimal? Percentage { get; set; }

    public decimal? Amount { get; set; }

    public virtual Order Order { get; set; } = null!;
}
