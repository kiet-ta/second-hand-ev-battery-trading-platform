using Application.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface INotificationService
    {
        Task RegisterClientAsync(HttpResponse response, CancellationToken token, string userId);
        Task UnRegisterClientAsync(HttpResponse response);
        Task SendNotificationAsync(string message, string? targetUserId = null);
        Task<bool> AddNewNotification(CreateNotificationDTO noti, int? senderId, string role);
        Task<bool> AddNotificationByIdAsync(CreateNotificationDTO noti, int receiverId, int senderId, string role);
        Task<bool> MarkNotificationAsReadAsync(int id);
        Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead);
        Task<List<Notification>> GetAllNotificationsAsync();
        Task<List<Notification>> GetNotificationsByReceiverIdAsync(int receiverId);
        Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType);
        Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId);
        Task<Notification> GetNotificationByIdAsync(int id);
        Task<bool> DeleteNotificationAsync(int id);
    }
}
