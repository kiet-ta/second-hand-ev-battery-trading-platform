using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class AuctionConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> entity)
    {
        entity.ToTable("auctions", t => t.ExcludeFromMigrations().HasTrigger("tr_Auctions_SetStatusOnDataChange"));
        entity.HasKey(e => e.AuctionId);

        entity.Property(e => e.AuctionId).HasColumnName("auction_id");
        entity.Property(e => e.ItemId).HasColumnName("item_id");
        entity.Property(e => e.StartingPrice).HasColumnName("starting_price").HasColumnType("decimal(18,2)");
        entity.Property(e => e.CurrentPrice).HasColumnName("current_price").HasColumnType("decimal(18,2)");
        entity.Property(e => e.TotalBids).HasColumnName("total_bids").HasDefaultValue(0);
        entity.Property(e => e.StartTime).HasColumnName("start_time");
        entity.Property(e => e.EndTime).HasColumnName("end_time");
        entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("upcoming");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");
        entity.Property(e => e.StepPrice)
              .HasColumnName("step_price");
        // Foreign key constraint
        entity.HasIndex(e => e.ItemId).IsUnique();
    }
}