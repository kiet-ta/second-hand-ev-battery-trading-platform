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
            entity.HasKey(e => e.ItemId).HasName("PK__battery___52020FDDC30195D9");

            entity.ToTable("battery_details");

            entity.Property(e => e.ItemId)
                .ValueGeneratedNever()
                .HasColumnName("item_id");
            entity.Property(e => e.Brand)
                .HasMaxLength(100)
                .HasColumnName("brand");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.ChargeCycles).HasColumnName("charge_cycles");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("updated_at");
            entity.Property(e => e.Voltage)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("voltage");

            entity.HasOne<Item>().WithOne()
                .HasForeignKey<BatteryDetail>(d => d.ItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__battery_d__item___4BAC3F29");
        }
    }
}
