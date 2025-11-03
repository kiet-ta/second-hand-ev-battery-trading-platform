using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices;

public interface INewsService
{
    Task<IEnumerable<News>> GetAllNewsAsync(int page, int pageSize);
    //Task<News> GetNewsById(int id);
    Task<bool> ApproveNewsAsync(int newsId);
    Task<bool> CancelNewsAsync(int newsId);
    Task<bool> AddNewsAsync(CreateNewsDto dto);
    Task DeleteNewsAsync(int newsId);
    Task<bool> RejectNewsAsync(int newsId);
}
