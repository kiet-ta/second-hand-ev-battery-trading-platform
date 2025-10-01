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
    public class KycDocumentConfiguration : IEntityTypeConfiguration<KycDocument>
    {
        public void Configure(EntityTypeBuilder<KycDocument> entity)
        {
            entity.ToTable("KYC_Document");

            entity.HasKey(e => e.DocId);

            entity.Property(e => e.DocId).HasColumnName("doc_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.DocType).HasColumnName("doc_type");
            entity.Property(e => e.DocUrl).HasColumnName("doc_url");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at");
            entity.Property(e => e.VerifiedBy).HasColumnName("verified_by");
            entity.Property(e => e.VerifiedAt).HasColumnName("verified_at");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Note).HasColumnName("note");

            // Relationship: KYC_Document -> User (owner)
            //entity.HasOne(k => k.User)
            //      .WithMany(u => u.KycDocuments)
            //      .HasForeignKey(k => k.UserId)
            //      .HasConstraintName("FK_KYC_User");

            // Relationship: KYC_Document -> VerifiedBy (User)
            //entity.HasOne(k => k.VerifiedByUser)
            //      .WithMany(u => u.KycVerifiedDocuments)
            //      .HasForeignKey(k => k.VerifiedBy)
            //      .HasConstraintName("FK_KYC_VerifiedBy_User")
            //      .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
