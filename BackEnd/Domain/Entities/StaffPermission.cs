using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class StaffPermission
    {
        public int StaffUserId { get; set; }
        public int PermissionId { get; set; }
    }
}
