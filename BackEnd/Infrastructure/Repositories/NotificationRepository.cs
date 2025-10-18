using Application.DTOs;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly EvBatteryTradingContext _context;

        public NotificationRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task AddNotificationAsync(CreateNotificationDTO noti)
        {
            var allUserIds = await _context.Users
                .Where(u => (bool)!u.IsDeleted)
                .Select(u => u.UserId)
                .ToListAsync();

            if (!allUserIds.Any())
            {
                Console.WriteLine("No users found to send notification.");
                return;
            }

            var notifications = allUserIds.Select(userId => new Notification
            {
                ReceiverId = userId,
                SenderId = noti.SenderId,  
                SenderRole = noti.SenderRole,
                NotiType = noti.NotiType,
                Title = noti.Title,
                Message = noti.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();

        }
    }
}
