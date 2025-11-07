using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
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
            _logger.LogInformation("AuctionStatusUpdaterJob running at: {time}", DateTimeOffset.Now);

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var auctionRepository = scope.ServiceProvider.GetRequiredService<IAuctionRepository>();
                    var finalizationService = scope.ServiceProvider.GetRequiredService<IAuctionFinalizationService>();
                    var context = scope.ServiceProvider.GetRequiredService<EvBatteryTradingContext>(); // DbContext to update status

                    var now = DateTime.Now;

                    var upcomingAuctions = await auctionRepository.GetUpcomingAuctionsAsync();
                    foreach (var auction in upcomingAuctions)
                    {
                        if (auction.StartTime <= now)
                        {
                            _logger.LogInformation($"Updating Auction {auction.AuctionId} status to ongoing.");
                            await auctionRepository.UpdateStatusAsync(auction, AuctionStatus.Ongoing.ToString());
                        }
                    }

                    //Find and finalize ended auctions
                    var endedAuctions = await auctionRepository.GetEndedAuctionsToFinalizeAsync(now);
                    // find auctions has EndTime < now and Status == "ongoing"

                    foreach (var auction in endedAuctions)
                    {
                        _logger.LogInformation($"Found ended Auction {auction.AuctionId}. Updating status and triggering finalization.");
                        // update status before finalize
                        // Use ExecuteUpdateAsync avoid load all entity if not need
                        await context.Auctions
                                .Where(a => a.AuctionId == auction.AuctionId && a.Status == AuctionStatus.Ongoing.ToString()) // Double check status
                                .ExecuteUpdateAsync(updates => updates.SetProperty(a => a.Status, AuctionStatus.Ended.ToString()), stoppingToken); //

                        // Call the service to process (don't await directly so the job doesn't block for a long time)
                        // If you need to ensure sequential processing, then await
                        // If you want to run in parallel (be careful with transactions), use Task.Run or another way
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

            // delay 1 minute before next check
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
        _logger.LogInformation("AuctionStatusUpdaterJob is stopping.");
    }
}