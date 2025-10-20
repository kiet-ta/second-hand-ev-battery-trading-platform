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
            response.Headers.Append("Content-Type", "text/event-stream");
            response.Headers.Append("Cache-Control", "no-cache");
            response.Headers.Append("Connection", "keep-alive");

            await response.WriteAsync(": connected\n\n");
            await response.Body.FlushAsync();

            _clients[userId] = response;
            Console.WriteLine($"User {userId} has successfully registered SSE ({_clients.Count} clients online)");

            token.Register(() =>
            {
                _clients.TryRemove(userId, out _);
                Console.WriteLine($"User {userId} SSE disconnected (cancellation triggered)");
            });

            response.HttpContext.Response.RegisterForDispose(new DisposableAction(() =>
            {
                _clients.TryRemove(userId, out _);
                Console.WriteLine($"User {userId} SSE connection disposed (closed)");
            }));

            while (_pendingMessages.TryDequeue(out var pending))
            {
                if (pending.userId == userId || string.IsNullOrEmpty(pending.userId))
                {
                    try
                    {
                        await response.WriteAsync($"data: {pending.message}\n\n");
                        await response.Body.FlushAsync();
                        Console.WriteLine($"Sent pending message to {userId}: {pending.message}");
                    }
                    catch
                    {
                        Console.WriteLine($"Failed to send pending message for {userId}");
                        _pendingMessages.Enqueue(pending);
                    }
                }
            }
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

            var targets = string.IsNullOrEmpty(targetUserId)
                ? _clients
                : _clients.Where(c => c.Key == targetUserId);

            var tasks = targets.Select(async client =>
            {
                try
                {
                    await client.Value.WriteAsync($"data: {message}\n\n");
                    await client.Value.Body.FlushAsync();
                    Console.WriteLine($"Sent message to user {client.Key}: {message}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send to {client.Key}: {ex.Message}");
                    _clients.TryRemove(client.Key, out _);
                    _pendingMessages.Enqueue((client.Key, message));
                }
            });

            await Task.WhenAll(tasks);
        }

        public async Task<bool> AddNewNotification(CreateNotificationDTO noti)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            try
            {
                await repo.AddNotificationAsync(noti);
                Console.WriteLine($"Notification saved to DB: {noti.Title} - {noti.Message}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving notification to DB: {ex.Message}");
                return false;
            }
        }
        public async Task<bool> DeleteNotificationAsync(int id)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.DeleteNotificationAsync(id);
        }
        public async Task<List<Notification>> GetNotificationsByReceiverIdAsync(int receiverId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetNotificationsByUserIdAsync(receiverId);
        }

        public async Task<List<Notification>> GetNotificationByNotiTypeAsync(string notiType)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetNotificationByNotiTypeAsync(notiType);
        }

        public async Task<List<Notification>> GetNotificationBySenderIdAsync(int senderId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetNotificationBySenderIdAsync(senderId);
        }

        public async Task<List<Notification>> GetNotificationByIdAsync(int id)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetNotificationById(id);
        }

        public async Task<List<Notification>> GetAllNotificationsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetAllNotificationsAsync();
        }
    }
}