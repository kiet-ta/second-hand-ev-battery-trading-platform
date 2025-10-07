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
    public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
    {
        public void Configure(EntityTypeBuilder<Favorite> entity)
        {
            entity.ToTable("Favorite");

            entity.HasKey(e => e.FavId);

            entity.Property(e => e.FavId).HasColumnName("fav_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ItemId).HasColumnName("item_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        }
    }
}
