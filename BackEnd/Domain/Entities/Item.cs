using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Item
{
    public int ItemId { get; set; }

    public string ItemType { get; set; } = string.Empty;

    public int? CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public int Quantity { get; set; }

    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int?     UpdatedBy { get; set; }

    public string? Moderation { get; set; }

    public bool IsDeleted { get; set; }
}