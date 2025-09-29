using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class ReviewImage
{
    public int ImageId { get; set; }

    public int ReviewId { get; set; }

    public string? ImageUrl { get; set; }

    public virtual Review Review { get; set; } = null!;
}
