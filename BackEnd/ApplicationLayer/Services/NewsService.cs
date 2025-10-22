using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class NewsService : INewsService
    {
        private readonly INewsRepository _newsRepository;

        public NewsService(INewsRepository newsRepository)
        {
            _newsRepository = newsRepository;
        }

        public async Task<bool> ApproveNewsAsync(int newsId)
        {
            var result = await _newsRepository.SetApprovedStatusAsync(newsId);
            if (!result)
                throw new Exception($"Failed to approve news with ID {newsId}");
            return true;
        }

        public async Task<bool> CancelNewsAsync(int newsId)
        {
            var result = await _newsRepository.SetCanclledStatusAsync(newsId);
            if (!result)
                throw new Exception($"Failed to cancel news with ID {newsId}");
            return true;
        }

        public async Task<bool> AddNewsAsync(CreateNewsDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "News data cannot be null");

            await _newsRepository.CreateNews(dto);
            return true;
        }

        public async Task DeleteNewsAsync(int newsId)
        {
            var success = await _newsRepository.DeleteNewsById(newsId);
            if (!success)
                throw new Exception($"Failed to delete news with ID {newsId}");
        }

        public async Task<bool> RejectNewsAsync(int newsId)
        {
            var result = await _newsRepository.UpdateNewsStatusAsync(newsId, "cancelled");
            if (!result)
                throw new Exception($"Failed to reject news with ID {newsId}");
            return true;
        }
    }
}
