using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface INewsRepository
    {
        Task<bool> SetApprovedStatusAsync(int newsId);
        Task<bool> SetCanclledStatusAsync(int newsId);
        Task<News> CreateNews(CreateNewsDto dto);
        Task<bool> DeleteNewsById(int newsId);

        Task<bool> UpdateNewsStatusAsync(int newsId, string status);
    }
}
