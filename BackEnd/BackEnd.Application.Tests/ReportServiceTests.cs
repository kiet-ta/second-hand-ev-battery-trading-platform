using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Application.Services;
using Domain.Common.Constants;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class ReportServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly ReportService _service;

        public ReportServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _service = new ReportService(null!, _mockUow.Object);
        }

        private Report MockReport(
            int id = 1, int userId = 1, int assigneeId = 2,
            ReportStatus status = ReportStatus.Pending)
            => new Report { Id = id, UserId = userId, AssigneeId = assigneeId, Status = status.ToString() };

        private CreateReportDto MockCreateReportDto(
            int userId = 1, ReportType type = ReportType.Bid_Violation, string reason = "Test")
            => new CreateReportDto { UserId = userId, Type = type.ToString(), Reason = reason };

        [Fact]
        public async Task GetAllReport_ShouldThrow_WhenNoReports()
        {
            _mockUow.Setup(u => u.Reports.GetAllReport()).ReturnsAsync(new List<Report>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetAllReport());
        }

        [Fact]
        public async Task GetAllReport_ShouldReturnReports()
        {
            var list = new List<Report> { MockReport() };
            _mockUow.Setup(u => u.Reports.GetAllReport()).ReturnsAsync(list);

            var result = await _service.GetAllReport();
            Assert.Single(result);
        }

        [Fact]
        public async Task GetReportById_ShouldThrow_WhenIdInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReportById(0));

        [Fact]
        public async Task GetReportById_ShouldThrow_WhenReportNotFound()
        {
            _mockUow.Setup(u => u.Reports.GetReportById(1)).ReturnsAsync((Report?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.GetReportById(1));
        }

        [Fact]
        public async Task GetReportById_ShouldReturnReport()
        {
            var report = MockReport();
            _mockUow.Setup(u => u.Reports.GetReportById(1)).ReturnsAsync(report);

            var result = await _service.GetReportById(1);
            Assert.Equal(report.Id, result.Id);
        }

        [Fact]
        public async Task GetReportByUserId_ShouldThrow_WhenUserIdInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReportByUserId(0));

        [Fact]
        public async Task GetReportByUserId_ShouldThrow_WhenNoReports()
        {
            _mockUow.Setup(u => u.Reports.GetReportByUserId(1)).ReturnsAsync(new List<Report>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetReportByUserId(1));
        }

        [Fact]
        public async Task GetReportByUserId_ShouldReturnReports()
        {
            var list = new List<Report> { MockReport() };
            _mockUow.Setup(u => u.Reports.GetReportByUserId(1)).ReturnsAsync(list);

            var result = await _service.GetReportByUserId(1);
            Assert.Single(result);
        }

        [Fact]
        public async Task GetReportByAssigneeId_ShouldThrow_WhenInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReportByAssigneeId(0));

        [Fact]
        public async Task GetReportByAssigneeId_ShouldThrow_WhenNoReports()
        {
            _mockUow.Setup(u => u.Reports.GetReportByAssigneeId(1)).ReturnsAsync(new List<Report>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetReportByAssigneeId(1));
        }

        [Fact]
        public async Task GetReportByAssigneeId_ShouldReturnReports()
        {
            var list = new List<Report> { MockReport() };
            _mockUow.Setup(u => u.Reports.GetReportByAssigneeId(1)).ReturnsAsync(list);

            var result = await _service.GetReportByAssigneeId(1);
            Assert.Single(result);
        }
        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public async Task GetReportByStatus_ShouldThrow_WhenInvalid(string status)
            => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReportByStatus(status!));

        [Fact]
        public async Task GetReportByStatus_ShouldThrow_WhenNoReports()
        {
            _mockUow.Setup(u => u.Reports.GetReportByStatus(ReportStatus.Pending.ToString()))
                .ReturnsAsync(new List<Report>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetReportByStatus(ReportStatus.Pending.ToString()));
        }

        [Fact]
        public async Task GetReportByStatus_ShouldReturnReports()
        {
            var list = new List<Report> { MockReport() };
            _mockUow.Setup(u => u.Reports.GetReportByStatus(ReportStatus.Pending.ToString()))
                .ReturnsAsync(list);

            var result = await _service.GetReportByStatus(ReportStatus.Pending.ToString());
            Assert.Single(result);
        }

        [Fact]
        public async Task UpdateReportStatus_ShouldThrow_WhenIdInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateReportStatus(0, ReportStatus.Approved.ToString(), 1, 1));

        [Fact]
        public async Task UpdateReportStatus_ShouldThrow_WhenStatusInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateReportStatus(1, "", 1, 1));

        [Fact]
        public async Task UpdateReportStatus_ShouldThrow_WhenAssigneeIdInvalid()
            => await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateReportStatus(1, ReportStatus.Approved.ToString(), 0, 1));

        [Fact]
        public async Task UpdateReportStatus_ShouldThrow_WhenRepoReturnsNull()
        {
            _mockUow.Setup(u => u.Reports.UpdateReportStatus(1, ReportStatus.Approved.ToString(), 1, 1))
                .ReturnsAsync((Report?)null);

            await Assert.ThrowsAsync<Exception>(() =>
                _service.UpdateReportStatus(1, ReportStatus.Approved.ToString(), 1, 1));
        }

        [Fact]
        public async Task UpdateReportStatus_ShouldReturnUpdatedReport()
        {
            var report = MockReport();
            _mockUow.Setup(u => u.Reports.UpdateReportStatus(1, ReportStatus.Approved.ToString(), 1, 1))
                .ReturnsAsync(report);

            var result = await _service.UpdateReportStatus(1, ReportStatus.Approved.ToString(), 1, 1);
            Assert.Equal(report.Id, result.Id);
        }

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenDtoNull()
            => await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateReport(null!, 1));

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenUserIdInvalid()
        {
            var dto = MockCreateReportDto(userId: 0);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReport(dto, 1));
        }

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenTypeEmpty()
        {
            var dto = MockCreateReportDto();
            dto.Type = "";
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReport(dto, 1));
        }

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenReasonEmpty()
        {
            var dto = MockCreateReportDto(reason: "");
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReport(dto, 1));
        }

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenSenderIdInvalid()
        {
            var dto = MockCreateReportDto();
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReport(dto, 0));
        }

        [Fact]
        public async Task CreateReport_ShouldThrow_WhenRepoReturnsNull()
        {
            var dto = MockCreateReportDto();
            _mockUow.Setup(u => u.Reports.CreateReport(dto, 1)).ReturnsAsync((Report?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.CreateReport(dto, 1));
        }

        [Fact]
        public async Task CreateReport_ShouldReturnReport()
        {
            var dto = MockCreateReportDto();
            var report = MockReport();
            _mockUow.Setup(u => u.Reports.CreateReport(dto, 1)).ReturnsAsync(report);

            var result = await _service.CreateReport(dto, 1);
            Assert.Equal(report.Id, result.Id);
        }
    }
}
