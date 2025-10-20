using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateNewsDto
    {

        public string? Title { get; set; }
        public string? Category { get; set; }

        public string? Summary { get; set; }

        public int AuthorId { get; set; }

        public string? ThumbnailUrl { get; set; }

        public string? Content { get; set; }
        public string? Tags { get; set; }

    }
}
