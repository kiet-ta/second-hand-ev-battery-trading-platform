using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }

        public string NotiType { get; set; } = null!; // 'activities' | 'news'

        public int? SenderId { get; set; }
        public string? SenderRole { get; set; } 

        public int ReceiverId { get; set; }

        public string? Title { get; set; }
        public string? Message { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
