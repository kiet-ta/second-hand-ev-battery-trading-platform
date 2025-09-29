using System;
using System.Collections.Generic;

namespace Infrastructure.Data;

public partial class ItemImage
{
    public int ImageId { get; set; }

    public int ItemId { get; set; }

    public string? ImageUrl { get; set; }

    public virtual Item Item { get; set; } = null!;
}
