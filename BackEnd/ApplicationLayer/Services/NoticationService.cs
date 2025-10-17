using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Collections.Concurrent;



namespace Application.Services
{
    public class NoticationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private ConcurrentDictionary<string, HttpResponse> _clients = new();

        public NoticationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }
        private class DisposableAction : IDisposable
        {
            private readonly Action _action;
            public DisposableAction(Action action) => _action = action;
            public void Dispose() => _action?.Invoke();
        }

        public async Task RegisterClientAsync(HttpResponse response, CancellationToken token)
        {
            response.Headers.Append("Content-Type", "text/event-stream");
            response.Headers.Append("Cache-Control", "no-cache");
            response.Headers.Append("Connection", "keep-alive");

            await response.WriteAsync(": connected\n\n");
            await response.Body.FlushAsync();

            var clientId = Guid.NewGuid().ToString();
            _clients.TryAdd(clientId, response);

            token.Register(() =>
            {
                _clients.TryRemove(clientId, out _);
            });

            response.HttpContext.Response.RegisterForDispose(new DisposableAction(() =>
            {
                _clients.TryRemove(clientId, out _);
            }));
        }
        public async Task UnRegisterClientAsync(HttpResponse response)
        {
            var client = _clients.FirstOrDefault(c => c.Value == response);
            if (client.Key != null)
            {
                _clients.TryRemove(client.Key, out _);
            }
            await Task.CompletedTask;
        }
        public async Task SendNotificationAsync(string message)
        {
            if (_clients.IsEmpty) return;
            var tasks = new List<Task>();
            foreach (var client in _clients)
            {
                var clientId = client.Key;
                var response = client.Value;

                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        await response.WriteAsync($"data: {message}\n\n");
                        await response.Body.FlushAsync();
                    }
                    catch
                    {
                        _clients.TryRemove(clientId, out _);
                    }
                }));

            }
            await Task.WhenAll(tasks);

        }
        public async Task<bool> AddNewNotification(CreateNotificationDTO noti)
        {
            try
            {
                await _notificationRepository.AddNotificationAsync(noti);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi khi lưu notification: {ex.Message}");
                throw;
            }
        }

    }
}