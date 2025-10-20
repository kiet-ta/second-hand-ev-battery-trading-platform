using Application.DTOs;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IMailService
    {
        Task SendWelcomeMailAsync(WelcomeDto request, string url);

        Task SendBanMailAsync(BanDto request, string reason, string url);

        Task SendPurchaseSuccessMailAsync(PurchaseSuccessDto request, string orderId, string url);

        Task SendPurchaseFailedMailAsync(PurchaseFailedDto request, string orderId, string reason, string url);
    }
}
