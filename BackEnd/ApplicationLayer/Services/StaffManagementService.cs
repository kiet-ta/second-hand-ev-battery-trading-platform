using Application.DTOs.ManageStaffDtos;
using Application.IRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IServices;
using AutoMapper;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

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
    public static int GenerateUserId()
    {
        var now = DateTime.UtcNow;
        string timestamp = now.ToString("yyyyMMddHHmmss");
        int random = new Random().Next(100, 999);
        string combined = timestamp + random.ToString();
        int hash = combined.GetHashCode();
        return Math.Abs(hash);
    }

    public async Task AssignPermissionsToStaffAsync(int staffId, List<int> permissionIds)
    {
        var staff = await _userRepository.GetByIdAsync(staffId);
        if (staff == null || staff.Role != "staff")
        {
            throw new Exception("Staff not found or user is not a staff member.");
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
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.");
        }
        var newUser = new User
        {
            UserId = GenerateUserId(),
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

        if (request.Permissions != null && request.Permissions.Any())
        {
            // get all permissions from Db
            var allPermissions = await _permissionRepository.GetAllPermissionAsync();
            var allPermissionsDict = allPermissions.ToDictionary(p => p.PermissionName, p => p.PermissionId, StringComparer.OrdinalIgnoreCase); // using Dic for faster

            //validate permission classification is in Db and not in Db
            var permissionIdsToAssign = new List<int>();
            var invalidPermissions = new List<string>();

            // Map permission name to ID
            foreach (var permissionName in request.Permissions)
            {
                if (allPermissionsDict.TryGetValue(permissionName, out var permissionId))
                {
                    permissionIdsToAssign.Add(permissionId);
                }
                else
                {
                    invalidPermissions.Add(permissionName);
                }
            }
            if (invalidPermissions.Any())
            {
                throw new ArgumentException($"Invalid permission names: {string.Join(", ", invalidPermissions)}");
            }

            // assign permission valid
            if (permissionIdsToAssign.Any())
            {
                await _staffPermissionRepository.AssignPermissionsToStaffAsync(newUser.UserId, permissionIdsToAssign);
            }
        }
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