using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Listing
{
    public int ListingId { get; set; }

    public string? ItemType { get; set; }

    public int ItemId { get; set; }

    public int SellerId { get; set; }

    public string? Status { get; set; }

    public decimal? AiSuggestedPrice { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ExternalUser Seller { get; set; } = null!;

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
