using Application.DTOs;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
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
            Console.WriteLine($"📩 Saving notification: {noti.Title} - {noti.Message}");
            var notification = new Notification
            {
                SenderId = noti.SenderId,
                NotiType = noti.NotiType,
                Title = noti.Title,
                Message = noti.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Notification saved to DB!");
        }
    }
}
