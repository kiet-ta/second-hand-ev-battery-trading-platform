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
            List<string> targetUserIds;
            if (!string.IsNullOrEmpty(noti.TargetUserId))
            {
                targetUserIds = new List<string> { noti.TargetUserId };
                Console.WriteLine($"[INFO] Sending notification only to TargetUserId = {noti.TargetUserId}");
            }
            else
            {
                targetUserIds = await _context.Users
                .Where(u => (bool)!u.IsDeleted)
                .Select(u => u.UserId.ToString())
                .ToListAsync();
            }
            if (!targetUserIds.Any())
            {
                Console.WriteLine("No users found to send notification.");
                return;
            }

            var notifications = targetUserIds.Select(userId => new Notification
            {
                ReceiverId = int.Parse(userId),
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
        public async Task<Notification?> GetNotificationByIdAsync(int id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id);

            return notification;
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

        public async Task<bool> MarkNotificationAsReadAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                throw new Exception($"Notification with ID {id} not found.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead)
        {
            var notifications = await _context.Notifications
                .Where(n => n.IsRead == isRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications;
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
