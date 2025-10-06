using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Blog
{
    public int BlogId { get; set; }

    public string? Title { get; set; }

    public DateOnly? PublishDate { get; set; }

    public string? Category { get; set; }

    public string? Summary { get; set; }

    public string? Author { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? Content { get; set; }

    public string? Tags { get; set; }
}
