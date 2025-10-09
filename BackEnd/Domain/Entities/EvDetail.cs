using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("ev_detail")]
    public class EVDetail
    {
        [Key]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("brand")]
        public string Brand { get; set; }

        [Column("model")]
        public string Model { get; set; }

        [Column("version")]
        public string Version { get; set; }

        [Column("year")]
        public int? Year { get; set; }

        [Column("body_style")]
        public string BodyStyle { get; set; }

        [Column("color")]
        public string Color { get; set; }

        [Column("license_plate")]
        public string LicensePlate { get; set; }

        [Column("has_accessories")]
        public bool? HasAccessories { get; set; }

        [Column("previous_owners")]
        public int? PreviousOwners { get; set; }

        [Column("is_registration_valid")]
        public bool? IsRegistrationValid { get; set; }

        [Column("mileage")]
        public int? Mileage { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
