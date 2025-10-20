using Application.DTOs;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Text;

namespace BackEnd.Application.Tests
{
    public class NotificationServiceTest
    {
        private readonly Mock<IServiceScopeFactory> _scopeFactoryMock;
        private readonly Mock<IServiceScope> _scopeMock;
        private readonly Mock<IServiceProvider> _serviceProviderMock;
        private readonly Mock<INotificationRepository> _notificationRepoMock;
        private readonly NotificationService _service;

        public NotificationServiceTest()
        {
            _scopeFactoryMock = new Mock<IServiceScopeFactory>();
            _scopeMock = new Mock<IServiceScope>();
            _serviceProviderMock = new Mock<IServiceProvider>();
            _notificationRepoMock = new Mock<INotificationRepository>();

            _scopeMock.Setup(s => s.ServiceProvider).Returns(_serviceProviderMock.Object);
            _scopeFactoryMock.Setup(f => f.CreateScope()).Returns(_scopeMock.Object);
            _serviceProviderMock
                .Setup(sp => sp.GetService(typeof(INotificationRepository)))
                .Returns(_notificationRepoMock.Object);

            _service = new NotificationService(_scopeFactoryMock.Object);
        }

        [Fact]
        public async Task AddNewNotification_ShouldReturnTrue_WhenNotificationIsAddedSuccessfully()
        {
            // Arrange
            var notiDto = new CreateNotificationDTO
            {
                NotiType = "info",
                SenderId = 1,
                SenderRole = "admin",
                Title = "Test Notification",
                Message = "This is a test message",
                TargetUserId = "user123"
            };

            _notificationRepoMock
                .Setup(r => r.AddNotificationAsync(It.IsAny<CreateNotificationDTO>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.AddNewNotification(notiDto);

            // Assert
            Assert.True(result);
            _notificationRepoMock.Verify(r => r.AddNotificationAsync(It.Is<CreateNotificationDTO>(
                n => n.Title == "Test Notification" && n.Message == "This is a test message"
            )), Times.Once);
        }

        [Fact]
        public async Task AddNewNotification_ShouldReturnFalse_WhenExceptionOccurs()
        {
            // Arrange
            var notiDto = new CreateNotificationDTO
            {
                NotiType = "error",
                Title = "Test",
                Message = "Test message",
                TargetUserId = "user123"
            };

            _notificationRepoMock
                .Setup(r => r.AddNotificationAsync(It.IsAny<CreateNotificationDTO>()))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _service.AddNewNotification(notiDto);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task DeleteNotificationAsync_ShouldReturnTrue_WhenDeleteSucceeds()
        {
            // Arrange
            int notificationId = 1;
            _notificationRepoMock
                .Setup(r => r.DeleteNotificationAsync(notificationId))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteNotificationAsync(notificationId);

            // Assert
            Assert.True(result);
            _notificationRepoMock.Verify(r => r.DeleteNotificationAsync(notificationId), Times.Once);
        }

        [Fact]
        public async Task DeleteNotificationAsync_ShouldReturnFalse_WhenDeleteFails()
        {
            // Arrange
            int notificationId = 999;
            _notificationRepoMock
                .Setup(r => r.DeleteNotificationAsync(notificationId))
                .ReturnsAsync(false);

            // Act
            var result = await _service.DeleteNotificationAsync(notificationId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetNotificationsByReceiverIdAsync_ShouldReturnNotifications_WhenReceiverExists()
        {
            // Arrange
            int receiverId = 1;
            var notifications = new List<Notification>
            {
                new Notification
                {
                    Id = 1,
                    NotiType = "info",
                    ReceiverId = receiverId,
                    Title = "Welcome",
                    Message = "Welcome to the app",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                },
                new Notification
                {
                    Id = 2,
                    NotiType = "alert",
                    ReceiverId = receiverId,
                    Title = "Alert",
                    Message = "Important update",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                }
            };

            _notificationRepoMock
                .Setup(r => r.GetNotificationsByUserIdAsync(receiverId))
                .ReturnsAsync(notifications);

            // Act
            var result = await _service.GetNotificationsByReceiverIdAsync(receiverId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.All(result, n => Assert.Equal(receiverId, n.ReceiverId));
        }

        [Fact]
        public async Task GetNotificationsByReceiverIdAsync_ShouldReturnEmptyList_WhenNoNotificationsExist()
        {
            // Arrange
            int receiverId = 999;
            _notificationRepoMock
                .Setup(r => r.GetNotificationsByUserIdAsync(receiverId))
                .ReturnsAsync(new List<Notification>());

            // Act
            var result = await _service.GetNotificationsByReceiverIdAsync(receiverId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetNotificationByNotiTypeAsync_ShouldReturnFilteredNotifications()
        {
            // Arrange
            string notiType = "alert";
            var notifications = new List<Notification>
            {
                new Notification
                {
                    Id = 1,
                    NotiType = notiType,
                    Title = "Alert 1",
                    Message = "First alert",
                    ReceiverId = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new Notification
                {
                    Id = 2,
                    NotiType = notiType,
                    Title = "Alert 2",
                    Message = "Second alert",
                    ReceiverId = 2,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _notificationRepoMock
                .Setup(r => r.GetNotificationByNotiTypeAsync(notiType))
                .ReturnsAsync(notifications);

            // Act
            var result = await _service.GetNotificationByNotiTypeAsync(notiType);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.All(result, n => Assert.Equal(notiType, n.NotiType));
        }

        [Fact]
        public async Task GetNotificationBySenderIdAsync_ShouldReturnNotificationsFromSender()
        {
            // Arrange
            int senderId = 5;
            var notifications = new List<Notification>
            {
                new Notification
                {
                    Id = 1,
                    SenderId = senderId,
                    Title = "Notification from sender",
                    Message = "Message",
                    ReceiverId = 10,
                    NotiType = "info",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _notificationRepoMock
                .Setup(r => r.GetNotificationBySenderIdAsync(senderId))
                .ReturnsAsync(notifications);

            // Act
            var result = await _service.GetNotificationBySenderIdAsync(senderId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(senderId, result[0].SenderId);
        }

        [Fact]
        public async Task GetNotificationByIdAsync_ShouldReturnNotification_WhenIdExists()
        {
            // Arrange
            int notificationId = 1;
            var notifications = new List<Notification>
            {
                new Notification
                {
                    Id = notificationId,
                    Title = "Test Notification",
                    Message = "Test Message",
                    ReceiverId = 1,
                    NotiType = "info",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _notificationRepoMock
                .Setup(r => r.GetNotificationById(notificationId))
                .ReturnsAsync(notifications);

            // Act
            var result = await _service.GetNotificationByIdAsync(notificationId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(notificationId, result[0].Id);
        }

        [Fact]
        public async Task GetAllNotificationsAsync_ShouldReturnAllNotifications()
        {
            // Arrange
            var notifications = new List<Notification>
            {
                new Notification { Id = 1, Title = "Notification 1", Message = "Message 1", ReceiverId = 1, NotiType = "info", CreatedAt = DateTime.UtcNow },
                new Notification { Id = 2, Title = "Notification 2", Message = "Message 2", ReceiverId = 2, NotiType = "alert", CreatedAt = DateTime.UtcNow },
                new Notification { Id = 3, Title = "Notification 3", Message = "Message 3", ReceiverId = 3, NotiType = "warning", CreatedAt = DateTime.UtcNow }
            };

            _notificationRepoMock
                .Setup(r => r.GetAllNotificationsAsync())
                .ReturnsAsync(notifications);

            // Act
            var result = await _service.GetAllNotificationsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
        }

        [Fact]
        public async Task GetAllNotificationsAsync_ShouldReturnEmptyList_WhenNoNotifications()
        {
            // Arrange
            _notificationRepoMock
                .Setup(r => r.GetAllNotificationsAsync())
                .ReturnsAsync(new List<Notification>());

            // Act
            var result = await _service.GetAllNotificationsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task SendNotificationAsync_ShouldReturnTrue_WhenReceiverIdIsValid()
        {
            // Arrange
            var notiDto = new CreateNotificationDTO
            {
                NotiType = "info",
                Title = "Test",
                Message = "Test message",
                TargetUserId = "user1"
            };
            int receiverId = 1;

            _notificationRepoMock
                .Setup(r => r.AddNotificationById(It.IsAny<CreateNotificationDTO>(), receiverId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.SendNotificationAsync(notiDto, receiverId);

            // Assert
            Assert.True(result);
            _notificationRepoMock.Verify(r => r.AddNotificationById(notiDto, receiverId), Times.Once);
        }

        [Fact]
        public async Task SendNotificationAsync_ShouldReturnFalse_WhenReceiverIdIsInvalid()
        {
            // Arrange
            var notiDto = new CreateNotificationDTO
            {
                NotiType = "info",
                Title = "Test",
                Message = "Test message"
            };
            int invalidReceiverId = 0;

            // Act
            var result = await _service.SendNotificationAsync(notiDto, invalidReceiverId);

            // Assert
            Assert.False(result);
            _notificationRepoMock.Verify(r => r.AddNotificationById(It.IsAny<CreateNotificationDTO>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task SendNotificationAsync_ShouldReturnFalse_WhenReceiverIdIsNegative()
        {
            // Arrange
            var notiDto = new CreateNotificationDTO
            {
                NotiType = "info",
                Title = "Test",
                Message = "Test message"
            };
            int negativeReceiverId = -5;

            // Act
            var result = await _service.SendNotificationAsync(notiDto, negativeReceiverId);

            // Assert
            Assert.False(result);
        }
    }
}