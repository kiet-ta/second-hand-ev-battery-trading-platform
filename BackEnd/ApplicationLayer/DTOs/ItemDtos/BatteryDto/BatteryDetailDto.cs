using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos.BatteryDto
{
    public class BatteryDetailDto
    {
        public int ItemId { get; set; }
        public string? Brand { get; set; }
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public string? Title { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }

    }
}
