using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface INotificationRepository
    {
        Task<Notification?> GetNotificationByIdAsync(int id);
        Task AddNotificationAsync(CreateNotificationDTO notification);
        Task<List<Notification>> GetNotificationsByUserIdAsync(int userId);
        Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType);
        Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId);
        Task<bool> DeleteNotificationAsync(int id);
        Task<List<Notification>> GetAllNotificationsAsync();
        Task AddNotificationById(CreateNotificationDTO noti, int receiverId);
        Task<bool> MarkNotificationAsReadAsync(int id);
        Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead);
    }
}
