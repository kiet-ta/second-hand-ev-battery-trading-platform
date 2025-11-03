using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateNotificationDTO
    {
        public string NotiType { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string TargetUserId { get; set; }
    }
}