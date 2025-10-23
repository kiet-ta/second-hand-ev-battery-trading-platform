using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ComplaintService : IComplaintService
    {
        private readonly IComplaintRepository _complaintRepository;

        public ComplaintService(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<Complaint> AddNewComplaint(CreateComplaintDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.Reason))
                throw new ArgumentException("Reason is required.");

            return await _complaintRepository.AddNewComplaint(dto);
        }

        public async Task<Complaint> GetComplaintById(int id)
        {
            var complaint = await _complaintRepository.GetComplaintById(id);
            if (complaint == null) throw new KeyNotFoundException($"Complaint with ID {id} not found.");
            return complaint;
        }

       
        public async Task<List<Complaint>> GetComplaintsByStatus(string status)
        {
            var list = await _complaintRepository.GetComplaintsByStatus(status);
            if (list.Count == 0) throw new KeyNotFoundException($"No complaints with status '{status}'.");
            return list;
        }

        public async Task<List<Complaint>> GetComplaintsByLevel(string level)
        {
            var list = await _complaintRepository.GetComplaintsByLevel(level);
            if (list.Count == 0) throw new KeyNotFoundException($"No complaints with severity level '{level}'.");
            return list;
        }

        public async Task<List<Complaint>> GetComplaintsByAssignee(int assignTo)
        {
            var list = await _complaintRepository.GetComplaintsByAssignee(assignTo);
            if (list.Count == 0) throw new KeyNotFoundException($"No complaints for assignee ID {assignTo}.");
            return list;
        }

        public async Task<List<Complaint>> GetComplaintsByUser(int userId)
        {
            var list = await _complaintRepository.GetComplaintsByUserId(userId);
            if (list.Count == 0) throw new KeyNotFoundException($"No complaints for user ID {userId}.");
            return list;
        }

        public async Task<bool> UpdateStatusComplaint(int complaintId, string status, int? assignTo = null)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status is required.");

            var success = await _complaintRepository.UpdateStatusComplaint(complaintId, status, assignTo);
            if (!success) throw new KeyNotFoundException($"Complaint ID {complaintId} not found.");
            return true;
        }

        public async Task<bool> UpdateLevelComplaint(int complaintId, string level, int? assignTo = null)
        {
            if (string.IsNullOrWhiteSpace(level))
                throw new ArgumentException("Severity level is required.");

            var success = await _complaintRepository.UpdateLevelComplaint(complaintId, level, assignTo);
            if (!success) throw new KeyNotFoundException($"Complaint ID {complaintId} not found.");
            return true;
        }

        public async Task<bool> DeleteComplaint(int complaintId)
        {
            var success = await _complaintRepository.DeleteComplaint(complaintId);
            if (!success) throw new KeyNotFoundException($"Complaint ID {complaintId} not found.");
            return true;
        }
    }
}
