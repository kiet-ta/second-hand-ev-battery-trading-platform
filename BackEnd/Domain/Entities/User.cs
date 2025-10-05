using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [Column("gender")]
        public string? Gender { get; set; }

        [Column("year_of_birth")]
        public DateTime YearOfBirth { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("avatar_profile")]
        public string? AvatarProfile { get; set; }

        [Column("role")]
        public string? Role { get; set; }

        [Column("kyc_status")]
        public  string? KycStatus { get; set; }

        [Column("account_status")]
        public string? AccountStatus { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; }
    }
}
