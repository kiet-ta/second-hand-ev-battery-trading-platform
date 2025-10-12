using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class ReviewImage
{
    public int ImageId { get; set; }

    public int ReviewId { get; set; }

    public string? ImageUrl { get; set; }

}
