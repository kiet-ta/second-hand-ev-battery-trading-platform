using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        // Set primary key
        builder.HasKey(p => p.PermissionId);

        // Configure properties
        builder.Property(p => p.PermissionId)
            .HasColumnName("permission_id")
            .IsRequired();

        builder.Property(p => p.PermissionName)
            .HasColumnName("permission_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(p => p.PermissionName)
    .IsUnique();

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasMaxLength(255);
    }
}