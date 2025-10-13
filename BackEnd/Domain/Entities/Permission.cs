namespace Domain.Entities;

public class Permission
{
    public int PermissionId { get; set; }
    public string PermissionName { get; set; }
    public string? Description { get; set; }
}