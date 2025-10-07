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
    public class UserLogConfiguration : IEntityTypeConfiguration<UserLog>
    {
        public void Configure(EntityTypeBuilder<UserLog> entity)
        {
            entity.ToTable("User_Log");

            entity.HasKey(e => e.LogId);

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Action).HasColumnName("action");
            entity.Property(e => e.Details).HasColumnName("details");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        }
    }
}
