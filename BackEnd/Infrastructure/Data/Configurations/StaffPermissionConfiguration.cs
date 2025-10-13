using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class StaffPermissionConfiguration : IEntityTypeConfiguration<StaffPermission>
{
    public void Configure(EntityTypeBuilder<StaffPermission> builder)
    {
        builder.ToTable("staff_permissions");
        // Set composite primary key
        builder.HasKey(sp => new { sp.StaffUserId, sp.PermissionId });

        // Configure properties
        builder.Property(sp => sp.StaffUserId)
            .HasColumnName("staff_user_id")
            .IsRequired();

        builder.Property(sp => sp.PermissionId)
            .HasColumnName("permission_id")
            .IsRequired();
    }
}