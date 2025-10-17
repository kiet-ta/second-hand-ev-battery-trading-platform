using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;


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



    }
}
