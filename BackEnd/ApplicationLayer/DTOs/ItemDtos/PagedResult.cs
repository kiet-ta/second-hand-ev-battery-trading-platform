using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class PagedResult<T> // where T : class
    {
        public int Page { get; init; }
        public int PageSize { get; init; }
        public long TotalCount { get; init; }
        public IReadOnlyList<T>? Items { get; init; }
    }
}
