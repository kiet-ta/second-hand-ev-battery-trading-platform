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
    public class BatteryDetailConfiguration : IEntityTypeConfiguration<BatteryDetail>
    {
        public void Configure(EntityTypeBuilder<BatteryDetail> entity)
        {
            entity.ToTable("Battery_Detail");

            entity.HasKey(e => e.ItemId); // PK is also FK to Item

            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.Brand).HasColumnName("brand");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.Voltage).HasColumnName("voltage");
            entity.Property(e => e.ChargeCycles).HasColumnName("charge_cycles");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");

            // Relationship: Battery_Detail 1-1 Item
            entity.HasOne<Item>()
                  .WithOne()
                  .HasForeignKey<BatteryDetail>(d => d.ItemId)
                  .HasConstraintName("FK_BatteryDetail_Item")
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
