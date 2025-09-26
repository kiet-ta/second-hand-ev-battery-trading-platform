using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Review
{
    public int ReviewId { get; set; }

    public int FromUser { get; set; }

    public int ToUser { get; set; }

    public int OrderId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ExternalUser FromUserNavigation { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual ExternalUser ToUserNavigation { get; set; } = null!;
}
