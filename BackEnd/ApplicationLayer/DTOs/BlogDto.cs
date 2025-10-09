namespace Application.DTOs;

public class BlogDto
{
    public string? Title { get; set; }
    public string? Category { get; set; }
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Content { get; set; }
    public string? Tags { get; set; }
    public int UserId { get; set; }
    public int AuthorId { get; set; }
}
}