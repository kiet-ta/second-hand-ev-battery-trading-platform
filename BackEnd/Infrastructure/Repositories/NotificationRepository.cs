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
        public async Task<List<Notification>> GetNotificationsByUserIdAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.ReceiverId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType)
        {
            return await _context.Notifications
                .Where(n => n.NotiType == notiType)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId)
        {
            return await _context.Notifications
                .Where(n => n.SenderId == senderId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetNotificationById(int id)
        {
            return await _context.Notifications
                .Where(n => n.Id == id)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetAllNotificationsAsync()
        {
            return await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
        public async Task<bool> DeleteNotificationAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task AddNotificationById(CreateNotificationDTO noti, int receiverId)
        {
            var notification = new Notification
            {
                ReceiverId = receiverId,
                SenderId = noti.SenderId,
                SenderRole = noti.SenderRole,
                NotiType = noti.NotiType,
                Title = noti.Title,
                Message = noti.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }



    }

}
