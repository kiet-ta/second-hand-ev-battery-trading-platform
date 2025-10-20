using Domain.Entities;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IEmailRepository
    {
        Task<string> GetNewStaffTemplateAsync(string email, string password, string actionUrl, string logoUrl);
        Task<string> GetWelcomeTemplate(string email, string url);      
        Task<string> GetBanTemplate(string userName, string reason, string url);
       
        Task<string> GetPurchaseSuccessTemplate(string userName, string orderId, string url);

        Task<string> GetPurchaseFailedTemplate(string userName, string orderId, string reason, string url);
    }
}

