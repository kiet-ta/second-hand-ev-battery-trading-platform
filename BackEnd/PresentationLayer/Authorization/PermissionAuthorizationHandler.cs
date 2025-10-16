using Application.IRepositories.IManageStaffRepositories;
using Microsoft.AspNetCore.Authorization;
using System.Runtime.InteropServices;
using System.Security.Claims;

namespace PresentationLayer.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<HasPermissionRequirement>
{
    private readonly IStaffPermissionRepository _staffPermissionRepository;
    private readonly IPermissionRepository _permissionRepository;

    public PermissionAuthorizationHandler(IStaffPermissionRepository staffPermissionRepository, IPermissionRepository permissionRepository)
    {
        _staffPermissionRepository = staffPermissionRepository;
        _permissionRepository = permissionRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, HasPermissionRequirement requirement)
    {
        //get userId from claim in token
        var userIdClaim = context.User.FindFirst(claim => claim.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return;
        }

        //get role
        var roleClaim = context.User.FindFirst(claim => claim.Type == ClaimTypes.Role);
        if (roleClaim == null)
        {
            return;
        }

        // if manager, auto pass permission
        if (roleClaim.Value == "manager")
        {
            context.Succeed(requirement);
            return;
        }

        if (roleClaim.Value == "staff")
        {
            var allPermission = await _permissionRepository.GetAllPermissionAsync();
            var requiredPermission = allPermission.FirstOrDefault(p => p.PermissionName.Equals(requirement.Permisssion, StringComparison.OrdinalIgnoreCase));

            if (requiredPermission == null)
            {
                return;
            }
            // Get the permissions this staff is assigned
            var staffPermissions = await _staffPermissionRepository.GetPermissionsByStaffIdAsync(userId);
            if (staffPermissions.Any(p => p.PermissionId == requiredPermission.PermissionId))
            {
                context.Succeed(requirement);
            }
        }
    }
}