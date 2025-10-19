using Application.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface INotificationService
    {
        Task RegisterClientAsync(HttpResponse response, CancellationToken token, string userId);
        Task UnRegisterClientAsync(HttpResponse response);
        Task SendNotificationAsync(string message, string? targetUserId = null);
        Task<bool> AddNewNotification(CreateNotificationDTO noti);


        Task<List<Notification>> GetAllNotificationsAsync();
        Task<List<Notification>> GetNotificationsByReceiverIdAsync(int receiverId);
        Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType);
        Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId);
        Task<List<Notification>> GetNotificationByIdAsync(int id);
        Task<bool> DeleteNotificationAsync(int id);

    }
}
