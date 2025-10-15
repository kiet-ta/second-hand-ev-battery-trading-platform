using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            builder.ToTable("permissions");

            builder.HasKey(p => p.PermissionId);

            builder.Property(p => p.PermissionId)
                .HasColumnName("permission_id");

            builder.Property(p => p.PermissionName)
                .HasColumnName("permission_name")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Description)
                .HasColumnName("description")
                .HasMaxLength(255);

            builder.HasIndex(p => p.PermissionName)
                .IsUnique();
        }
    }
}
