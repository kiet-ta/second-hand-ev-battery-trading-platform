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

        public async Task<Complaint> AddNewComplaint(CreateComplaintDto dto, int userId)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Complaint data must not be null.");

            if (string.IsNullOrWhiteSpace(dto.Reason))
                throw new ArgumentException("Reason is required.", nameof(dto.Reason));

            if (userId <= 0)
                throw new ArgumentException("Invalid user ID.", nameof(userId));

            return await _complaintRepository.AddNewComplaint(dto, userId);
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

        public async Task<bool> UpdateStatusComplaint(int complaintId, string status, int userId)
        {
            if (complaintId <= 0)
                throw new ArgumentException("Invalid complaint ID.");

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status is required.");

            var updated = await _complaintRepository.UpdateStatusComplaint(complaintId, status, userId);

            if (!updated)
                throw new KeyNotFoundException($"Complaint with ID {complaintId} not found or already deleted.");

            return true;
        }


        public async Task<bool> UpdateLevelComplaint(int complaintId, string level, int userId)
        {
            if (complaintId <= 0)
                throw new ArgumentException("Invalid complaint ID.");

            if (string.IsNullOrWhiteSpace(level))
                throw new ArgumentException("Severity level is required.");

            var updated = await _complaintRepository.UpdateLevelComplaint(complaintId, level, userId);

            if (!updated)
                throw new KeyNotFoundException($"Complaint with ID {complaintId} not found or already deleted.");

            return true;
        }


        public async Task<bool> DeleteComplaint(int complaintId, int userId)
        {
            if (complaintId <= 0)
                throw new ArgumentException("Invalid complaint ID.");

            var deleted = await _complaintRepository.DeleteComplaint(complaintId, userId);

            if (!deleted)
                throw new KeyNotFoundException($"Complaint with ID {complaintId} not found or already deleted.");

            return true;
        }
        public async Task<List<Complaint>> GetallComplaint()
        {
            var list = await _complaintRepository.GetallComplaint();
            if (list.Count == 0) throw new KeyNotFoundException("No complaints found.");
            return list;

        }
    } 
}
