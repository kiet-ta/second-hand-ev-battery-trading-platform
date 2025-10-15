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
    public class StaffPermissionConfiguration : IEntityTypeConfiguration<StaffPermission>
    {
        public void Configure(EntityTypeBuilder<StaffPermission> builder)
        {
            builder.ToTable("staff_permissions");

            builder.HasKey(sp => new { sp.StaffUserId, sp.PermissionId });

            builder.Property(sp => sp.StaffUserId)
                .HasColumnName("staff_user_id");

            builder.Property(sp => sp.PermissionId)
                .HasColumnName("permission_id");

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(sp => sp.StaffUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Permission>()
                .WithMany()
                .HasForeignKey(sp => sp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
