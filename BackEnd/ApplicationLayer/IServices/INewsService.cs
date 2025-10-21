using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface INewsService
    {
        Task<bool> ApproveNewsAsync(int newsId);
        Task<bool> CancelNewsAsync(int newsId);
        Task<bool> AddNewsAsync(CreateNewsDto dto);
        Task DeleteNewsAsync(int newsId);
        Task<bool> RejectNewsAsync(int newsId);
    }
}
