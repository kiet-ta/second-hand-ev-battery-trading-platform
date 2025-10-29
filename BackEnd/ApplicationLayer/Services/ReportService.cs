using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<List<Report>> GetAllReport()
        {
            var reports = await _reportRepository.GetAllReport();
            if (reports == null || !reports.Any())
                throw new Exception("No reports found in the system.");

            return reports;
        }

        public async Task<Report> GetReportById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid report ID.");

            var report = await _reportRepository.GetReportById(id);
            if (report == null)
                throw new Exception($"No report found with ID = {id}.");

            return report;
        }

        public async Task<List<Report>> GetReportByUserId(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Invalid user ID.");

            var reports = await _reportRepository.GetReportByUserId(userId);
            if (reports == null || !reports.Any())
                throw new Exception($"No reports found for user ID = {userId}.");

            return reports;
        }

        public async Task<List<Report>> GetReportByAssigneeId(int assigneeId)
        {
            if (assigneeId <= 0)
                throw new ArgumentException("Invalid assignee ID.");

            var reports = await _reportRepository.GetReportByAssigneeId(assigneeId);
            if (reports == null || !reports.Any())
                throw new Exception($"No reports assigned to assignee ID = {assigneeId}.");

            return reports;
        }

        public async Task<List<Report>> GetReportByStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status cannot be null or empty.");

            var reports = await _reportRepository.GetReportByStatus(status);
            if (reports == null || !reports.Any())
                throw new Exception($"No reports found with status '{status}'.");

            return reports;
        }

        public async Task<Report> UpdateReportStatus(int id, string status, int assigneeId)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid report ID.");

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status cannot be null or empty.");

            if (assigneeId <= 0)
                throw new ArgumentException("Invalid assignee ID.");

            var updatedReport = await _reportRepository.UpdateReportStatus(id, status, assigneeId);
            if (updatedReport == null)
                throw new Exception($"Failed to update report with ID = {id}. The report may not exist.");

            return updatedReport;
        }

        public async Task<Report> CreateReport(CreateReportDto dto, int senderId)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Report creation data cannot be null.");

            if (dto.UserId <= 0)
                throw new ArgumentException("Invalid user ID in the report.");

           

            if (string.IsNullOrWhiteSpace(dto.Type))
                throw new ArgumentException("Report type cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(dto.Reason))
                throw new ArgumentException("Report reason cannot be null or empty.");

            if (senderId <= 0)
                throw new ArgumentException("Invalid senderId ID for report creation.");

            var report = await _reportRepository.CreateReport(dto, senderId);
            if (report == null)
                throw new Exception("Failed to create report. Please try again.");

            return report;
        }
    }
}
