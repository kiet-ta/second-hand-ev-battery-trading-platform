using Application.DTOs.ManageStaffDtos;
using Application.IRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IServices;
using AutoMapper;
using Domain.Entities;

namespace Application.Services;

public class StaffManagementService : IStaffManagementService
{
    private readonly IUserRepository _userRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IStaffPermissionRepository _staffPermissionRepository;
    private readonly IMapper _mapper;

    public StaffManagementService(
            IUserRepository userRepository,
            IPermissionRepository permissionRepository,
            IStaffPermissionRepository staffPermissionRepository,
            IMapper mapper)
    {
        _userRepository = userRepository;
        _permissionRepository = permissionRepository;
        _staffPermissionRepository = staffPermissionRepository;
        _mapper = mapper;
    }

    public async Task AssignPermissionsToStaffAsync(int staffId, List<int> permissionIds)
    {
        var staff = await _userRepository.GetByIdAsync(staffId);
        if (staff == null || staff.Role != "staff")
        {
            throw new Exception("Staff not found.");
        }
        await _staffPermissionRepository.AssignPermissionsToStaffAsync(staffId, permissionIds);
    }

    public async Task<User> CreateStaffAccountAsync(CreateStaffRequestDto request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new Exception("Email already exists.");
        }
        var newUser = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Phone = request.Phone,
            Role = "staff",
            AccountStatus = "active",
            KycStatus = "not_submitted",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
        await _userRepository.AddAsync(newUser);
        return newUser;
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        var permissions = await _permissionRepository.GetAllPermissionAsync();
        return _mapper.Map<List<PermissionDto>>(permissions);
    }

    public async Task<List<PermissionDto>> GetPermissionsByStaffIdAsync(int staffId)
    {
        var assignedPermissions = await _staffPermissionRepository.GetPermissionsByStaffIdAsync(staffId);
        var assignedPermissionIds = assignedPermissions.Select(p => p.PermissionId).ToList();

        var allPermissions = await _permissionRepository.GetAllPermissionAsync();

        var result = allPermissions.Where(p => assignedPermissionIds.Contains(p.PermissionId)).ToList();

        return _mapper.Map<List<PermissionDto>>(result);
    }
}