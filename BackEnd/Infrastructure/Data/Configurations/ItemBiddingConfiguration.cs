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
    public class ItemBiddingConfiguration : IEntityTypeConfiguration<ItemBidding>
    {
        public void Configure(EntityTypeBuilder<ItemBidding> entity)
        {
            entity.HasKey(e => e.BiddingId).HasName("PK__Item_Bid__5C3BD3C5EF131C43");

            entity.ToTable("Item_Bidding");

            entity.HasIndex(e => e.ItemId, "UQ__Item_Bid__52020FDC03D0B220").IsUnique();

            entity.Property(e => e.BiddingId).HasColumnName("bidding_id");
            entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime")
                    .HasColumnName("created_at");
            entity.Property(e => e.CurrentPrice)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("current_price");
            entity.Property(e => e.EndTime)
                    .HasColumnType("datetime")
                    .HasColumnName("end_time");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.StartTime)
                    .HasColumnType("datetime")
                    .HasColumnName("start_time");
            entity.Property(e => e.StartingPrice)
                    .HasColumnType("decimal(18, 2)")
                    .HasColumnName("starting_price");
            entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("active")
                    .HasColumnName("status");
            entity.HasOne<Item>().WithOne()//(p => p.ItemBidding)
                .HasForeignKey<ItemBidding>(d => d.ItemId)
                .HasConstraintName("FK__Item_Bidd__item___03F0984C");
        }    
    }
}
