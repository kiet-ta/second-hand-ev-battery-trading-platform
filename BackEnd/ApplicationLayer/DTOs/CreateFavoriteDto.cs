using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateFavoriteDto
    {
        public int UserId { get; set; }
        public int ItemId { get; set; }
        public DateOnly CreatedAt { get; set; }
    }
}
