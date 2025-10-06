using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class ItemBiddingConfiguration : IEntityTypeConfiguration<ItemBidding>
{
    public void Configure(EntityTypeBuilder<ItemBidding> entity)
    {
        entity.ToTable("Item_Bidding");
        entity.HasKey(e => e.BiddingId);

        entity.Property(e => e.BiddingId).HasColumnName("bidding_id");
        entity.Property(e => e.ItemId).HasColumnName("item_id");
        entity.Property(e => e.StartingPrice).HasColumnName("starting_price");
        entity.Property(e => e.CurrentPrice).HasColumnName("current_price");
        entity.Property(e => e.StartTime).HasColumnName("start_time");
        entity.Property(e => e.EndTime).HasColumnName("end_time");
        entity.Property(e => e.Status).HasColumnName("status");
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
    }
}