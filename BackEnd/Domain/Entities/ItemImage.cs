using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class ItemImage
{
    public int ImageId { get; set; }

    public int ItemId { get; set; }

    public string? ImageUrl { get; set; }

}
