using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs.ReviewDtos
{
    public class ReviewResponseDto
    {
        public int ReviewerId { get; set; }
        public int TargetUserId { get; set; }
        public int ItemId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateOnly ReviewDate { get; set; }
        public DateOnly UpdateAt { get; set; }

        public List<ReviewImageResponseDto>? ReviewImages { get; set; }
    }
}
