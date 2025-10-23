namespace Application.IServices;

public interface IMessagePublisher
{
    void PublistOutbidEvent(OutbidEventDto outbidEvent);
}