using Microsoft.AspNetCore.Authorization;

namespace PresentationLayer.Authorization;

public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
            : base(policy: permission)
    {
    }
}