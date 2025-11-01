using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ManageCompanyDtos
{
    public class TransactionItemDto
    {
        public int ItemId { get; set; }
        public string Title { get; set; }
        public decimal Amount { get; set; }
    }
}
