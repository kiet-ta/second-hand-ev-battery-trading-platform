using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class News
{
    public int NewsId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }
    public string? Status { get; set; }

    public DateTime? PublishDate { get; set; }

    public string? Category { get; set; }

    public string? Summary { get; set; }

    public int AuthorId { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? Content { get; set; }

    public string? Tags { get; set; }


    }
