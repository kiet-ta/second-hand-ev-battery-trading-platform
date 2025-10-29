using Application.DTOs.AuctionDtos;

namespace Application.IServices;

public interface IMessagePublisher
{
    void PublishOutbidEvent(OutbidEventDto outbidEvent);
}