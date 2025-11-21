using Domain.Entities;

namespace Application.IRepositories.IManageStaffRepositories;

public interface IStaffPermissionRepository
{
    Task<List<StaffPermission>> GetPermissionsByStaffIdAsync(int id);

    Task AssignPermissionsToStaffAsync(int staffId, List<int> permissionIds);
}