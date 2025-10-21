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
            // 🚨 Headers are now assumed to be set correctly in the Controller.

            // 1. Client registration and initial message
            _clients[userId] = response;
            Console.WriteLine($"[DEBUG-C#] User {userId} registered. Total clients: {_clients.Count}");

            await response.WriteAsync($": connected\n\n");
            await response.Body.FlushAsync();

            // 2. Setup TaskCompletionSource (Robust persistence signal)
            var completionSource = new TaskCompletionSource<bool>();

            // 3. Register Cleanup logic on token cancellation (client disconnects)
            token.Register(() =>
            {
                _clients.TryRemove(userId, out _);
                Console.WriteLine($"[DEBUG-C#] Client {userId} removed by cancellation.");
                // Signal the completion source that the connection is done
                completionSource.TrySetResult(true);
            });

            // 4. Handle HTTP context disposal cleanup (e.g., Kestrel closing pipe)
            response.HttpContext.Response.RegisterForDispose(new DisposableAction(() =>
            {
                if (_clients.TryRemove(userId, out _))
                {
                    Console.WriteLine($"[DEBUG-C#] Client {userId} removed by HTTP context disposal.");
                }
                completionSource.TrySetResult(true);
            }));

            // 5. Pending messages (processing logic remains the same)
            while (_pendingMessages.TryDequeue(out var pending))
            {
                // (omitted pending message dispatch logic for brevity)
                if (pending.userId == userId || string.IsNullOrEmpty(pending.userId))
                {
                    try
                    {
                        await response.WriteAsync($"data: {pending.message}\n\n");
                        await response.Body.FlushAsync();
                    }
                    catch
                    {
                        _pendingMessages.Enqueue(pending);
                    }
                }
            }


            // 6. Await the signal, effectively keeping the HTTP connection alive
            // The Task will only complete when the TrySetResult is called via cancellation/disposal.
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

        // ------------------------------------------------------------------
        // Standard Service Methods (No changes needed)
        // ------------------------------------------------------------------
        public async Task<bool> AddNewNotification(CreateNotificationDTO noti)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            try
            {
                await repo.AddNotificationAsync(noti);

                Console.WriteLine($"Notification saved to DB: {noti.Title} - {noti.Message}");
                Console.WriteLine($"Target ID used for persistence: {noti.TargetUserId ?? "BROADCAST"}");

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