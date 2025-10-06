using Application.DTOs;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IMailService
    {
        Task SendWelcomeMailAsync(WelcomeDTO request, string url);

        Task SendBanMailAsync(BanDTO request, string reason, string url);

        Task SendPurchaseSuccessMailAsync(PurchaseSuccessDTO request, string orderId, string url);

        Task SendPurchaseFailedMailAsync(PurchaseFailedDTO request, string orderId, string reason, string url);
    }
}
