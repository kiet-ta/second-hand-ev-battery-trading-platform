using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Review
{
    public int ReviewId { get; set; }

    public int ReviewerId { get; set; }

    public int TargetUserId { get; set; }

    public int ItemId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

}
