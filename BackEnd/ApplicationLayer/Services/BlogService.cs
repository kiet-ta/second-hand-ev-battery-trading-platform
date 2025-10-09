using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services;

public class BlogService : IBlogService
{
    private readonly IBlogRepository _blogRepository;

    public BlogService(IBlogRepository repository)
    {
        _blogRepository = repository;
    }

    public async Task<Blog> CreateBlogAsync(BlogDto dto)
    {
        if (string.IsNullOrEmpty(dto.Content))
            throw new ArgumentException("Blog content is required.");

        var blog = new Blog
        {
            UserId = dto.UserId,
            AuthorId = dto.AuthorId,
            Title = dto.Title,
            Category = dto.Category,
            Summary = dto.Summary,
            ThumbnailUrl = dto.ThumbnailUrl,
            Content = dto.Content,
            Tags = dto.Tags,
            PublishDate = DateTime.Now
        };
        var x = GetAllBlogsAsync();

        return await _blogRepository.CreateAsync(blog);
    }

    public async Task<IEnumerable<Blog>> GetAllBlogsAsync() => await _blogRepository.GetAllAsync();

    public async Task<Blog?> GetBlogByIdAsync(int id) => await _blogRepository.GetByIdAsync(id);
}