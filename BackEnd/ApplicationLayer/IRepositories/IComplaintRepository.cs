using Application.DTOs;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IComplaintRepository
    {
        Task<Complaint> AddNewComplaint(CreateComplaintDto dto, int userId);
        Task<Complaint?> GetComplaintById(int id);
        Task<List<Complaint>> GetComplaintsByStatus(string status);
        Task<List<Complaint>> GetComplaintsByLevel(string level);
        Task<List<Complaint>> GetComplaintsByAssignee(int assignTo);
        Task<List<Complaint>> GetComplaintsByUserId(int userId);
        Task<bool> UpdateLevelComplaint(int complaintId, string level, int assignTo); 
        Task<bool> DeleteComplaint(int complaintId, int userId);
        Task<bool> UpdateStatusComplaint(int complaintId, string level, int assignTo);
        Task<List<Complaint>> GetallComplaint();
    }
}
