using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[Route("api/blogs")]
[ApiController]
public class BlogsController : ControllerBase
{
    private readonly BlogService _blogService;

    public BlogsController(BlogService blogService)
    {
        _blogService = blogService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBlog([FromBody] BlogDto blogDto)
    {
        try
        {
            var blog = await _blogService.CreateBlogAsync(blogDto);
            return Ok(new { message = "Blog created successfully.", blog_id = blog.BlogId });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetBlogs()
    {
        var blogs = await _blogService.GetAllBlogsAsync();
        return Ok(blogs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBlog(int id)
    {
        var blog = await _blogService.GetBlogByIdAsync(id);
        if (blog == null)
            return NotFound(new { message = "Blog not found." });

        return Ok(blog);
    }
}