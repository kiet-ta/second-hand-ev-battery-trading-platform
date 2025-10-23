using Application.DTOs;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ComplaintRepository : IComplaintRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ComplaintRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }
        //public async Task<double> GetComplaintRateAsync()
        //{
        //    var totalSellers = await _context.Users
        //        .CountAsync(u => u.Role == "seller" && !u.IsDeleted);

        //    var sellersWithComplaints = await _context.Complaints
        //        .Select(c => c.SellerId)
        //        .Distinct()
        //        .CountAsync();

        //    return totalSellers == 0 ? 0 : Math.Round((double)sellersWithComplaints / totalSellers * 100, 2);
        //}
        public async Task<Complaint> AddNewComplaint(CreateComplaintDto dto, int userId)
        {
            var complaint = new Complaint
            {
                UserId = userId, 
                AssignTo = null,
                Reason = dto.Reason,
                Description = dto.Description,
                Status = dto.Status ?? "pending",
                SeverityLevel = dto.SeverityLevel ?? "medium",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();
            return complaint;
        }

        public async Task<Complaint?> GetComplaintById(int id)
        {
            return await _context.Complaints.FirstOrDefaultAsync(c => c.ComplaintId == id && !c.IsDeleted);
        }

    

        public async Task<List<Complaint>> GetComplaintsByStatus(string status)
        {
            return await _context.Complaints
                .Where(c => c.Status.ToLower() == status.ToLower() && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Complaint>> GetComplaintsByLevel(string level)
        {
            return await _context.Complaints
                .Where(c => c.SeverityLevel.ToLower() == level.ToLower() && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Complaint>> GetComplaintsByAssignee(int assignTo)
        {
            return await _context.Complaints
                .Where(c => c.AssignTo == assignTo && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Complaint>> GetComplaintsByUserId(int userId)
        {
            return await _context.Complaints
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<bool> UpdateStatusComplaint(int complaintId, string status, int assignTo)
        {
            var complaint = await _context.Complaints
                .FirstOrDefaultAsync(c => c.ComplaintId == complaintId && !c.IsDeleted);

            if (complaint == null) return false;

            complaint.Status = status.ToLower();
            complaint.UpdatedAt = DateTime.UtcNow;
            complaint.AssignTo = assignTo; 

            await _context.SaveChangesAsync();
            return true;
        }

       
        public async Task<bool> UpdateLevelComplaint(int complaintId, string level, int assignTo)
        {
            var complaint = await _context.Complaints
                .FirstOrDefaultAsync(c => c.ComplaintId == complaintId && !c.IsDeleted);

            if (complaint == null) return false;

            complaint.SeverityLevel = level.ToLower();
            complaint.UpdatedAt = DateTime.UtcNow;
            complaint.AssignTo = assignTo; 

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteComplaint(int complaintId, int userId)
        {
            var complaint = await _context.Complaints
                .FirstOrDefaultAsync(c => c.ComplaintId == complaintId && !c.IsDeleted);

            if (complaint == null) return false;

            complaint.IsDeleted = true;
            complaint.UpdatedAt = DateTime.UtcNow;
            complaint.AssignTo = userId;

            await _context.SaveChangesAsync();
            return true;
        }


    }
}


