using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    [Table("battery_detail")]
    public class BatteryDetail
    {
        [Key]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("brand")]
        public string Brand { get; set; }

        [Column("capacity")]
        public int? Capacity { get; set; }

        [Column("voltage")]
        public decimal? Voltage { get; set; }

        [Column("charge_cycles")]
        public int? ChargeCycles { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
