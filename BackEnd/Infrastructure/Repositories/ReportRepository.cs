using Application.DTOs;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly EvBatteryTradingContext _context;
        public ReportRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }
        public async Task<List<Report>> GetAllReport()
        {
            return await _context.Reports.ToListAsync();
        }

        public async Task<Report> GetReportById(int id)
        {
            return await _context.Reports.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<Report>> GetReportByUserId(int userId)
        {
            return await _context.Reports
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Report>> GetReportByAssigneeId(int assigneeId)
        {
            return await _context.Reports
                .Where(r => r.AssigneeId == assigneeId)
                .ToListAsync();
        }
        public async Task<List<Report>> GetReportByStatus(string status)
        {
            return await _context.Reports
                .Where(r => r.Status == status)
                .ToListAsync();
        }

        public async Task<Report> UpdateReportStatus(int id, string status, int assigneeId)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.Id == id);
            if (report != null)
            {
                report.AssigneeId = assigneeId;
                report.Status = status;

                if (status == "pending" || status == "rejected")
                {
                    report.BanAt = null;
                    report.UnbanAt = null;
                    report.Duration = null;
                }
                else if (status == "approved")
                {
                    report.BanAt = DateTime.Now;

                    if (report.Duration.HasValue)
                        report.UnbanAt = report.BanAt.Value.AddDays(report.Duration.Value);
                }

                await _context.SaveChangesAsync();
            }

            return report;
        }

        public async Task<Report> CreateReport(CreateReportDto createReportDto, int senderId)
        {
            var report = new Report
            {
                UserId = createReportDto.UserId,
                SenderId = senderId,
                Type = createReportDto.Type,
                Reason = createReportDto.Reason,
                Detail = createReportDto.Detail,
                AssigneeId = null,
                CreatedAt = DateTime.Now,
                Status = "pending",
                Duration = null,
                BanAt = null,
                UnbanAt = null
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }
    }
}

