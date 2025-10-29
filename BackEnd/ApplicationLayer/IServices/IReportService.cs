using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IReportService
    {
        Task<List<Report>> GetAllReport();
        Task<Report> GetReportById(int id);
        Task<List<Report>> GetReportByUserId(int userId);
        Task<List<Report>> GetReportByAssigneeId(int assigneeId);
        Task<List<Report>> GetReportByStatus(string status);
        Task<Report> UpdateReportStatus(int id, string status, int assigneeId, int day);
        Task<Report> CreateReport(CreateReportDto dto, int assigneeTo);
    }
}
