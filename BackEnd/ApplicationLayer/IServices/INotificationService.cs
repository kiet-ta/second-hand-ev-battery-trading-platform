using Application.DTOs;
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
    }
}
