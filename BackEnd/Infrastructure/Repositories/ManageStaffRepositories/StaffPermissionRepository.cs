using Application.IRepositories.IManageStaffRepositories;
using Application.IServices;
using Domain;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.ManageStaffRepositories;

public class StaffPermissionRepository : IStaffPermissionRepository
{
    private readonly EvBatteryTradingContext _context;

    public StaffPermissionRepository(EvBatteryTradingContext context)
    {
        _context = context;
    }

    public async Task<List<StaffPermission>> GetPermissionsByStaffIdAsync(int id) => await _context.StaffPermissions.Where(sp => sp.StaffUserId == id).AsNoTracking().ToListAsync();

    public async Task AssignPermissionsToStaffAsync(int staffId, List<int> permissionIds)
    {
        var existingPermission = await _context.StaffPermissions.Where(sp => sp.StaffUserId == staffId).AsNoTracking().ToListAsync();
        if (existingPermission.Count != 0)
        {
            _context.StaffPermissions.RemoveRange(existingPermission);
        }

        if (permissionIds != null && permissionIds.Count != 0)
        {
            var newPermissions = permissionIds.Select(permissionId => new StaffPermission
            {
                StaffUserId = staffId,
                PermissionId = permissionId
            });
            await _context.StaffPermissions.AddRangeAsync(newPermissions);
        }
        await _context.SaveChangesAsync();
    }
}