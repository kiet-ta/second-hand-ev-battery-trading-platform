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
            return await _newsRepository.SetApprovedStatusAsync(newsId);
        }
        public async Task<bool> CancelNewsAsync(int newsId)
        {
            return await _newsRepository.SetCanclledStatusAsync(newsId);
        }
    }
}
