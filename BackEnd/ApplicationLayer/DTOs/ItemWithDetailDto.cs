using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ItemWithDetailDto
    {
        public int ItemId { get; set; }
        public string? Title { get; set; }
        public string? ItemType { get; set; }

        // Quan hệ phụ
        public EvDetail? EVDetail { get; set; }
        public BatteryDetail? BatteryDetail { get; set; }
    }
}
