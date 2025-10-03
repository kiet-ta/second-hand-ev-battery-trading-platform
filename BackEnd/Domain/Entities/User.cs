using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;
[Table("Users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("gender")]
    public string? Gender { get; set; }

    [Column("year_of_birth")]
    public DateTime? YearOfBirth { get; set; }

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(500)]
    [Column("avatar_profile")]
    public string? AvatarProfile { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("role")]
    public string Role { get; set; } = "Buyer";

    [MaxLength(20)]
    [Column("kyc_status")]
    public string KycStatus { get; set; } = "not_submitted";

    [MaxLength(20)]
    [Column("account_status")]
    public string AccountStatus { get; set; } = "active";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [Column("is_deleted")]
    public bool? IsDeleted { get; set; } 
}

