using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class AuctionConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> entity)
    {
        entity.HasKey(e => e.AuctionId).HasName("PK__auctions__2FF7864090E84C90");

        entity.ToTable("auctions");

        entity.HasIndex(e => e.ItemId, "UQ__auctions__52020FDC72C015F2").IsUnique();

        entity.Property(e => e.AuctionId).HasColumnName("auction_id");
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
            .HasDefaultValue("upcoming")
            .HasColumnName("status");
        entity.Property(e => e.TotalBids)
            .HasDefaultValue(0)
            .HasColumnName("total_bids");
        entity.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())")
            .HasColumnType("datetime")
            .HasColumnName("updated_at");

        entity.HasOne<Item>().WithOne()
            .HasForeignKey<Auction>(d => d.ItemId)
            .HasConstraintName("FK__auctions__item_i__08B54D69");
    }
}