using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace PresentationLayer.Authorization;

public class HasPermissionRequirement : IAuthorizationRequirement
{
    public string Permisssion { get; }

    public HasPermissionRequirement(string permission)
    {
        Permisssion = permission;
    }
}