using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System.Runtime.InteropServices;

namespace Application.Services
{
    public class NewsService : INewsService
    {
        private readonly INewsRepository _newsRepository;

        public NewsService(INewsRepository newsRepository)
        {
            _newsRepository = newsRepository;
        }

        public async Task<IEnumerable<News>> GetAllNewsAsync(int page, int pageSize)
        {
            return await _newsRepository.GetAllNewsAsync(page, pageSize);
        }
        public async Task<bool> ApproveNewsAsync(int newsId)
        {
            var result = await _newsRepository.SetApprovedStatusAsync(newsId);
            if (!result)
                throw new Exception($"Failed to approve news with ID {newsId}");
            if (newsId <= 0)
                throw new ArgumentException("Invalid news ID.");

            var success = await _newsRepository.SetApprovedStatusAsync(newsId);
            if (!success)
                throw new KeyNotFoundException($"News with ID {newsId} not found.");

            return true;
        }

        public async Task<News> GetBynewsId(int id)
        {
            return await _newsRepository.GetNewsByIdAsync(id);
        }
        public async Task<bool> CancelNewsAsync(int newsId)
        {
            var result = await _newsRepository.SetCanclledStatusAsync(newsId);
            if (!result)
                throw new Exception($"Failed to cancel news with ID {newsId}");
            if (newsId <= 0)
                throw new ArgumentException("Invalid news ID.");

            var success = await _newsRepository.SetCanclledStatusAsync(newsId);
            if (!success)
                throw new KeyNotFoundException($"News with ID {newsId} not found.");

            return true;
        }

        public async Task<bool> AddNewsAsync(CreateNewsDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "News data cannot be null.");

            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("News title cannot be empty.");

            await _newsRepository.CreateNews(dto);
            return true;
        }

        public async Task DeleteNewsAsync(int newsId)
        {
            if (newsId <= 0)
                throw new ArgumentException("Invalid news ID.");

            var success = await _newsRepository.DeleteNewsById(newsId);
            if (!success)
                throw new KeyNotFoundException($"News with ID {newsId} not found.");
        }

        public async Task<bool> RejectNewsAsync(int newsId)
        {
            if (newsId <= 0)
                throw new ArgumentException("Invalid news ID.");

            var success = await _newsRepository.UpdateNewsStatusAsync(newsId, "cancelled");
            if (!success)
                throw new KeyNotFoundException($"News with ID {newsId} not found.");

            return true;
        }
    }
}
