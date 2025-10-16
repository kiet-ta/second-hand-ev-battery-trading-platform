using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Review
{
    public int ReviewId { get; set; }

    public int ReviewerId { get; set; }

    public int TargetUserId { get; set; }
    public int ItemId { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // public DateOnly? UpdatedAt { get; set; }
    public virtual Item Item { get; set; }
    public virtual ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();
}

