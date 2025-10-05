using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IHistorySoldService
    {
        Task<List<object>> GetAllSellerItemsAsync(int sellerId);
        Task<List<object>> GetProcessingItemsAsync(int sellerId);
        Task<List<object>> GetPendingPaymentItemsAsync(int sellerId);
        Task<List<object>> GetSoldPaymentItemsAsync(int sellerId);
    }

}
