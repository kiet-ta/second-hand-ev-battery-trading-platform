using Application.IRepositories;
using Application.IServices;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Workers;

public class AuctionStatusUpdaterJob : BackgroundService
{
    private readonly ILogger<AuctionStatusUpdaterJob> _logger;
    private readonly IServiceProvider _serviceProvider; // resolve scoped services

    public AuctionStatusUpdaterJob(ILogger<AuctionStatusUpdaterJob> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AuctionStatusUpdaterJob is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            _logger.LogInformation("AuctionStatusUpdaterJob running at: {time}", now);

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var auctionRepository = scope.ServiceProvider.GetRequiredService<IAuctionRepository>();
                    var finalizationService = scope.ServiceProvider.GetRequiredService<IAuctionFinalizationService>();
                    var context = scope.ServiceProvider.GetRequiredService<EvBatteryTradingContext>(); // DbContext to update status

                    var upcomingAuctions = await auctionRepository.GetUpcomingAuctionsAsync();
                    foreach (var auction in upcomingAuctions)
                    {
                        if (auction.StartTime <= now)
                        {
                            _logger.LogInformation($"Updating Auction {auction.AuctionId} status to ongoing.");
                            await auctionRepository.UpdateStatusAsync(auction, "ongoing");
                        }
                    }

                    //Find and finalize ended auctions
                    var endedAuctions = await auctionRepository.GetEndedAuctionsToFinalizeAsync(now);
                    // find auctions has EndTime < now and Status == "ongoing"

                    foreach (var auction in endedAuctions)
                    {
                        _logger.LogInformation($"Found ended Auction {auction.AuctionId}. Updating status and triggering finalization.");

                        //call service
                        try
                        {
                            await finalizationService.FinalizeAuctionAsync(auction.AuctionId);
                        }
                        catch (Exception finalizationEx)
                        {
                            _logger.LogError(finalizationEx, $"Error finalizing Auction {auction.AuctionId} in background job. It might need manual check.");
                            // read log error but dont end job
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred executing AuctionStatusUpdaterJob.");
            }

            // delay 5 second before next check
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
        _logger.LogInformation("AuctionStatusUpdaterJob is stopping.");
    }
}