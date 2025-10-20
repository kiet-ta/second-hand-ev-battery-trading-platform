using Application.DTOs.ManageStaffDtos;
using Domain.Entities;

namespace Application.IServices;

public interface IStaffManagementService
{
    Task<User> CreateStaffAccountAsync(CreateStaffRequestDto createStaffDto);

    Task AssignPermissionsToStaffAsync(int staffId, List<int> permissionIds);

    Task<List<PermissionDto>> GetPermissionsByStaffIdAsync(int staffId);

    Task<List<PermissionDto>> GetAllPermissionsAsync();
}