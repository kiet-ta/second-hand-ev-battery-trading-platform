using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> entity)
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370FDA44BDD3");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E61640C3B9CBE").IsUnique();

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.AccountStatus)
                .HasMaxLength(20)
                .HasDefaultValue("active")
                .HasColumnName("account_status");
            entity.Property(e => e.AvatarProfile)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("avatar_profile");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender)
                .HasMaxLength(50)
                .HasColumnName("gender");
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .HasColumnName("is_deleted");
            entity.Property(e => e.KycStatus)
                .HasMaxLength(20)
                .HasDefaultValue("not_submitted")
                .HasColumnName("kyc_status");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("updated_at");
            entity.Property(e => e.YearOfBirth)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("year_of_birth");
        }
    }
}