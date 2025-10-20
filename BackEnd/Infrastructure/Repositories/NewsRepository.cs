using Application.DTOs;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using System.Reactive;


namespace Infrastructure.Repositories
{
    public class NewsRepository : INewsRepository
    {
        private readonly EvBatteryTradingContext _context;
        public NewsRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }
        public async Task<News> GetNewsByIdAsync(int newsId)
        {
            return await _context.News.FindAsync(newsId);
        }

        public async Task<bool> SetApprovedStatusAsync(int newsId)
        {
            var news = await GetNewsByIdAsync(newsId);
            if (news == null)
            {
                return false;
            }
            news.Status = "approved";
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> SetCanclledStatusAsync(int newsId)
        {
            var news = await GetNewsByIdAsync(newsId);
            if (news == null)
            {
                return false;
            }
            news.Status = "cancelled";
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteNewsById(int newsId)
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return false;

            news.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<News> CreateNews(CreateNewsDto dto)
        {
            var news = new News
            {
                Title = dto.Title,
                Status =  "pending",
                PublishDate = DateTime.UtcNow,
                Category = dto.Category,
                Summary = dto.Summary,
                AuthorId = dto.AuthorId,
                ThumbnailUrl = dto.ThumbnailUrl,
                Content = dto.Content,
                IsDeleted = false,
                Tags = dto.Tags,
            };

            await _context.News.AddAsync(news); 
            await _context.SaveChangesAsync(); 

            return news;
        }
        public async Task<bool> UpdateNewsStatusAsync(int newsId, string status)
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return false;

            news.Status = status;
            await _context.SaveChangesAsync();

            return true;
        }

    }
}



