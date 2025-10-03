using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Item
{
    public int ItemId { get; set; }

    public string? ItemType { get; set; }

    public int? CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public int? Quantity { get; set; }

    public string? Status { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public bool? IsDeleted { get; set; }

    //public virtual BatteryDetail? BatteryDetail { get; set; }

    //public virtual Category? Category { get; set; }

    //public virtual EvDetail? EvDetail { get; set; }

    //public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    //public virtual ICollection<ItemImage> ItemImages { get; set; } = new List<ItemImage>();

    //public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    //public virtual User? UpdatedByNavigation { get; set; }
}
