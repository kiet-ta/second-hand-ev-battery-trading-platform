using Application.IRepositories.IManageStaffRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories.ManageStaffRepositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly EvBatteryTradingContext _context;

    public PermissionRepository(EvBatteryTradingContext context)
    {
        _context = context;
    }

    public async Task<List<Permission>> GetAllPermissionAsync() => await _context.Permissions.AsNoTracking().ToListAsync();
}