using Application.DTOs;
using Domain.Entities;

namespace Application.IServices;

public interface IBlogService
{
    public Task<Blog> CreateBlogAsync(BlogDto dto);

    public Task<IEnumerable<Blog>> GetAllBlogsAsync();

    public Task<Blog?> GetBlogByIdAsync(int id);
}