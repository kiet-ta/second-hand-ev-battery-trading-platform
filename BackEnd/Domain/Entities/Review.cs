using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class Review
{
    public int ReviewId { get; set; }

    public int ReviewerId { get; set; }

    public int TargetUserId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

    public virtual ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();

    public virtual User Reviewer { get; set; } = null!;

    public virtual User TargetUser { get; set; } = null!;
}
