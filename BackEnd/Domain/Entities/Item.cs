using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Item
{
    public int ItemId { get; set; }

    public int SellerId { get; set; }

    public string? ItemType { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual BatteryDetail? BatteryDetail { get; set; }

    public virtual EvDetail? EvDetail { get; set; }

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<ItemImage> ItemImages { get; set; } = new List<ItemImage>();

    public virtual User Seller { get; set; } = null!;

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
