using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Concurrent;

namespace Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConcurrentDictionary<string, HttpResponse> _clients = new();
        private readonly ConcurrentQueue<(string userId, string message)> _pendingMessages = new();

        public NotificationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        private class DisposableAction : IDisposable
        {
            private readonly Action _action;
            public DisposableAction(Action action) => _action = action;
            public void Dispose() => _action?.Invoke();
        }

        public async Task RegisterClientAsync(HttpResponse response, CancellationToken token, string userId)
        {
            _clients[userId] = response;
            Console.WriteLine($"[DEBUG-C#] User {userId} registered. Total clients: {_clients.Count}");

            await response.WriteAsync($": connected\n\n");
            await response.Body.FlushAsync();

            var completionSource = new TaskCompletionSource<bool>();

            token.Register(() =>
            {
                _clients.TryRemove(userId, out _);
                Console.WriteLine($"[DEBUG-C#] Client {userId} removed by cancellation.");
                completionSource.TrySetResult(true);
            });

            response.HttpContext.Response.RegisterForDispose(new DisposableAction(() =>
            {
                if (_clients.TryRemove(userId, out _))
                {
                    Console.WriteLine($"[DEBUG-C#] Client {userId} removed by HTTP context disposal.");
                }
                completionSource.TrySetResult(true);
            }));

            while (_pendingMessages.TryDequeue(out var pending))
            {
                if (pending.userId == userId || string.IsNullOrEmpty(pending.userId))
                {
                    await response.WriteAsync($"data: {pending.message}\n\n");
                    await response.Body.FlushAsync();
                }
            }

            await completionSource.Task;
        }

        public async Task UnRegisterClientAsync(HttpResponse response)
        {
            var client = _clients.FirstOrDefault(c => c.Value == response);
            if (!string.IsNullOrEmpty(client.Key))
            {
                _clients.TryRemove(client.Key, out _);
                Console.WriteLine($"User {client.Key} manually unregistered SSE connection.");
            }

            await Task.CompletedTask;
        }

        public async Task SendNotificationAsync(string message, string? targetUserId = null)
        {
            if (_clients.IsEmpty)
            {
                Console.WriteLine($"No SSE clients connected — message queued: {message}");
                _pendingMessages.Enqueue((targetUserId ?? "", message));
                return;
            }

            IEnumerable<KeyValuePair<string, HttpResponse>> targets;

            if (string.IsNullOrEmpty(targetUserId))
            {
                targets = _clients.ToArray();
                Console.WriteLine($"[DEBUG] Broadcasting message to all clients: {message}");
            }
            else if (_clients.TryGetValue(targetUserId, out var targetResponse))
            {
                targets = new[] { new KeyValuePair<string, HttpResponse>(targetUserId, targetResponse) };
                Console.WriteLine($"[DEBUG] Targeted message to user {targetUserId}: {message}");
            }
            else
            {
                Console.WriteLine($"[DEBUG] Target user {targetUserId} not connected — queuing message.");
                _pendingMessages.Enqueue((targetUserId, message));
                return;
            }

            var tasks = targets.Select(async client =>
            {
                await client.Value.WriteAsync($"data: {message}\n\n");
                await client.Value.Body.FlushAsync();
                Console.WriteLine($"Sent message to user {client.Key}: {message}");
            });

            await Task.WhenAll(tasks);
        }

        public async Task<bool> AddNewNotification(CreateNotificationDto noti, int senderId, string role)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            await repo.AddNotificationAsync(noti, senderId, role);

            Console.WriteLine($"Notification saved to DB: {noti.Title} - {noti.Message}");
            Console.WriteLine($"Target ID used for persistence: {noti.TargetUserId ?? "BROADCAST"}");

            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int id)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.DeleteNotificationAsync(id);
            if (!result)
                throw new Exception("Failed to delete notification.");

            return true;
        }

        public async Task<List<Notification>> GetNotificationsByReceiverIdAsync(int receiverId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.GetNotificationsByUserIdAsync(receiverId);
            if (result == null)
                throw new KeyNotFoundException("No notifications found for this user.");

            return result;
        }

        public async Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.GetNotificationByNotiTypeAsync(notiType);
            if (result == null)
                throw new KeyNotFoundException("No notifications found for this type.");

            return result;
        }

        public async Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.GetNotificationBySenderIdAsync(senderId);
            if (result == null)
                throw new KeyNotFoundException("No notifications found for this sender.");

            return result;
        }

        public async Task<Notification> GetNotificationByIdAsync(int id)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.GetNotificationByIdAsync(id);
            if (result == null)
                throw new KeyNotFoundException("Notification not found.");

            return result;
        }
        public async Task<bool> AddNotificationByIdAsync(CreateNotificationDto noti, int receiverId,int senderId, string role)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            if (noti == null)
                throw new ArgumentNullException(nameof(noti));

            await repo.AddNotificationById(noti, receiverId, senderId, role);
            return true;
        }

        public async Task<List<Notification>> GetAllNotificationsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var result = await repo.GetAllNotificationsAsync();
            if (result == null)
                throw new Exception("Failed to retrieve all notifications.");

            return result;
        }
        public async Task<bool> MarkNotificationAsReadAsync(int id)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var notification = await repo.GetNotificationByIdAsync(id);
            if (notification == null)
                throw new Exception($"Notification with ID {id} not found.");

            var result = await repo.MarkNotificationAsReadAsync(id);
            if (!result)
                throw new Exception("Failed to update notification status.");

            return true;
        }

        public async Task<List<Notification>> GetNotificationsByReadStatusAsync(bool isRead)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            var notifications = await repo.GetNotificationsByReadStatusAsync(isRead);

            if (notifications == null || notifications.Count == 0)
                throw new Exception($"No {(isRead ? "read" : "unread")} notifications found.");

            return notifications;
        }

    }
}
