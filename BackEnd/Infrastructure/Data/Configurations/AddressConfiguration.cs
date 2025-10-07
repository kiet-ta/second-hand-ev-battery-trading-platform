using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> entity)
        {
            entity.ToTable("Address");

            entity.HasKey(e => e.AddressId);

            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.RecipientName).HasColumnName("recipient_name");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Street).HasColumnName("street");
            entity.Property(e => e.Ward).HasColumnName("ward");
            entity.Property(e => e.District).HasColumnName("district");
            entity.Property(e => e.Province).HasColumnName("province");
            entity.Property(e => e.IsDefault).HasColumnName("is_default");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsDeleted).HasColumnName("is_deleted");
        }
    }
}
