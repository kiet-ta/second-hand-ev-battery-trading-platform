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
    public class EvDetailConfiguration : IEntityTypeConfiguration<EVDetail>
    {
        public void Configure(EntityTypeBuilder<EVDetail> entity)
        {
            entity.ToTable("EV_Detail");

            entity.HasKey(e => e.ItemId); // PK is also FK to Item

            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.Brand).HasColumnName("brand");
            entity.Property(e => e.Model).HasColumnName("model");
            entity.Property(e => e.Version).HasColumnName("version");
            entity.Property(e => e.Year).HasColumnName("year");
            entity.Property(e => e.BodyStyle).HasColumnName("body_style");
            entity.Property(e => e.Color).HasColumnName("color");
            entity.Property(e => e.LicensePlate).HasColumnName("license_plate");
            entity.Property(e => e.HasAccessories).HasColumnName("has_accessories").HasDefaultValue(false);
            entity.Property(e => e.PreviousOwners).HasColumnName("previous_owners").HasDefaultValue(1);
            entity.Property(e => e.IsRegistrationValid).HasColumnName("is_registration_valid").HasDefaultValue(false);
            entity.Property(e => e.Mileage).HasColumnName("mileage");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");

            // Relationship: EV_Detail 1-1 Item (Item is principal)
            entity.HasOne<Item>()
                  .WithOne()
                  .HasForeignKey<EVDetail>(d => d.ItemId)
                  .HasConstraintName("FK_EVDetail_Item")
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
