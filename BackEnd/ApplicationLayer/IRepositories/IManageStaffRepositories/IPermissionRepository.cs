using Domain.Entities;

namespace Application.IRepositories.IManageStaffRepositories;

public interface IPermissionRepository
{
    Task<List<Permission>> GetAllPermissionAsync();
}