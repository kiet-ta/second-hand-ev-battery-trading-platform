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
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> entity)
        {
            entity.ToTable("Users");

            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.FullName).HasColumnName("full_name");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Gender).HasColumnName("gender").IsRequired(false);
            entity.Property(e => e.YearOfBirth).HasColumnName("year_of_birth").IsRequired(false);
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.AvatarProfile).HasColumnName("avatar_profile").IsRequired(false);
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.KycStatus).HasColumnName("kyc_status");
            entity.Property(e => e.AccountStatus).HasColumnName("account_status");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        }
    }
}
