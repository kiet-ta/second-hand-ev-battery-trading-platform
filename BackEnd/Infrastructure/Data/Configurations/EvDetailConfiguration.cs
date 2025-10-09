using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Org.BouncyCastle.Asn1.Cmp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Configurations
{
    public class EVDetailConfiguration : IEntityTypeConfiguration<EVDetail>
    {
        public void Configure(EntityTypeBuilder<EVDetail> entity)
        {
            entity.HasKey(e => e.ItemId).HasName("PK__ev_detai__52020FDD8C33BFB7");

            entity.ToTable("ev_details");

            entity.HasIndex(e => e.LicensePlate, "UQ__ev_detai__F72CD56E36E9D667").IsUnique();

            entity.Property(e => e.ItemId)
                .ValueGeneratedNever()
                .HasColumnName("item_id");
            entity.Property(e => e.BodyStyle)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("body_style");
            entity.Property(e => e.Brand)
                .HasMaxLength(100)
                .HasColumnName("brand");
            entity.Property(e => e.Color)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("color");
            entity.Property(e => e.HasAccessories)
                .HasDefaultValue(false)
                .HasColumnName("has_accessories");
            entity.Property(e => e.IsRegistrationValid)
                .HasDefaultValue(false)
                .HasColumnName("is_registration_valid");
            entity.Property(e => e.LicensePlate)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("license_plate");
            entity.Property(e => e.Mileage).HasColumnName("mileage");
            entity.Property(e => e.Model)
                .HasMaxLength(100)
                .HasColumnName("model");
            entity.Property(e => e.PreviousOwners)
                .HasDefaultValue(1)
                .HasColumnName("previous_owners");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("updated_at");
            entity.Property(e => e.Version)
                .HasMaxLength(255)
                .HasColumnName("version");
            entity.Property(e => e.Year).HasColumnName("year");

            entity.HasOne<Item>().WithOne()
                .HasForeignKey<EVDetail>(d => d.ItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ev_detail__item___47DBAE45");
        }
    }
}
