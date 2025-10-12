using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("KYC_Document")]
    public class KycDocument
    {
        [Key]
        [Column("doc_id")]
        public int DocId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [MaxLength(500)]
        [Column("id_card_url")]
        public string? IdCardUrl { get; set; }

        [MaxLength(500)]
        [Column("vehicle_registration_url")]
        public string? VehicleRegistrationUrl { get; set; }

        [MaxLength(500)]
        [Column("selfie_url")]
        public string? SelfieUrl { get; set; }

        [MaxLength(500)]
        [Column("doc_url")]
        public string? DocUrl { get; set; }

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; } = DateTime.Now;

        [Column("verified_by")]
        public int? VerifiedBy { get; set; }

        [Column("verified_at")]
        public DateTime? VerifiedAt { get; set; }

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("note")]
        public string? Note { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [ForeignKey(nameof(VerifiedBy))]
        public virtual User? Verifier { get; set; }
    }
}
