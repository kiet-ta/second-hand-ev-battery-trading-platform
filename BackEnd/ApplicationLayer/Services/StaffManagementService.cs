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
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
        _staffPermissionRepository = staffPermissionRepository ?? throw new ArgumentNullException(nameof(staffPermissionRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
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
        var staff = await _userRepository.GetByIdAsync(staffId)
                    ?? throw new InvalidOperationException("Staff not found.");
        if (staff.Role != "staff")
            throw new InvalidOperationException("User is not a staff member.");

        if (permissionIds == null || !permissionIds.Any())
            throw new ArgumentException("Permission list cannot be empty.", nameof(permissionIds));

        await _staffPermissionRepository.AssignPermissionsToStaffAsync(staffId, permissionIds);
    }

    public async Task<User> CreateStaffAccountAsync(CreateStaffRequestDto request)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters long.", nameof(request.Password));
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

        await _userRepository.AddAsync(newUser); // không dùng ?? throw
                                                 // nếu muốn, có thể check sau saveChanges:
                                                 // await _userRepository.SaveChangesAsync();

        if (request.Permissions != null && request.Permissions.Any())
        {
            var allPermissions = await _permissionRepository.GetAllPermissionAsync();
            if (allPermissions == null)
            {
                throw new InvalidOperationException("Failed to retrieve permissions.");
            }

            var allPermissionsDict = allPermissions.ToDictionary(
                p => p.PermissionName,
                p => p.PermissionId,
                StringComparer.OrdinalIgnoreCase
            );

            var permissionIdsToAssign = new List<int>();
            var invalidPermissions = new List<string>();

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

            if (permissionIdsToAssign.Any())
            {
                await _staffPermissionRepository.AssignPermissionsToStaffAsync(newUser.UserId, permissionIdsToAssign);
            }
        }

        return newUser;
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        var permissions = await _permissionRepository.GetAllPermissionAsync()
            ?? throw new InvalidOperationException("Failed to retrieve permissions.");

        return _mapper.Map<List<PermissionDto>>(permissions);
    }

    public async Task<List<PermissionDto>> GetPermissionsByStaffIdAsync(int staffId)
    {
        var assignedPermissions = await _staffPermissionRepository.GetPermissionsByStaffIdAsync(staffId)
            ?? throw new InvalidOperationException($"Failed to get permissions for staffId {staffId}.");

        var assignedPermissionIds = assignedPermissions.Select(p => p.PermissionId).ToList();

        var allPermissions = await _permissionRepository.GetAllPermissionAsync()
            ?? throw new InvalidOperationException("Failed to retrieve permissions.");

        var result = allPermissions.Where(p => assignedPermissionIds.Contains(p.PermissionId)).ToList();

        return _mapper.Map<List<PermissionDto>>(result);
    }
}
