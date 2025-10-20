using Application.DTOs.ManageCompanyDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface ITransactionRepository
    {
        Task<List<LatestTransactionDto>> GetLatestTransactionsAsync(int limit);
    }
}
