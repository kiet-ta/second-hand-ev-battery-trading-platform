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
            entity.HasKey(e => e.DocId).HasName("PK__kyc_docu__8AD02924ABC10C6A");

            entity.ToTable("kyc_documents");

            entity.Property(e => e.DocId).HasColumnName("doc_id");
            entity.Property(e => e.DocUrl)
                .HasMaxLength(500)
                .HasColumnName("doc_url");
            entity.Property(e => e.IdCardUrl)
                .HasMaxLength(500)
                .HasColumnName("id_card_url");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.SelfieUrl)
                .HasMaxLength(500)
                .HasColumnName("selfie_url");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");
            entity.Property(e => e.SubmittedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("submitted_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VehicleRegistrationUrl)
                .HasMaxLength(500)
                .HasColumnName("vehicle_registration_url");
            entity.Property(e => e.VerifiedAt)
                .HasColumnType("datetime")
                .HasColumnName("verified_at");
            entity.Property(e => e.VerifiedBy).HasColumnName("verified_by");

            entity.HasOne<User>().WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__kyc_docum__user___7C4F7684");

            //entity.HasOne(d => d.VerifiedByNavigation).WithMany(p => p.KycDocumentVerifiedByNavigations)
            //    .HasForeignKey(d => d.VerifiedBy)
            //    .HasConstraintName("FK__kyc_docum__verif__7D439ABD");
        }
    }
}
