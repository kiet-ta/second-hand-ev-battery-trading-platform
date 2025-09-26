using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Wishlist
{
    public int WishlistId { get; set; }

    public int UserId { get; set; }

    public int ListingId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Listing Listing { get; set; } = null!;

    public virtual ExternalUser User { get; set; } = null!;
}
