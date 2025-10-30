using Application.DTOs.PaymentDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Application.Mappings;
using Application.Services;
using Application.Validations;
using FluentValidation;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Infrastructure.Repositories.ManageStaffRepositories;

namespace PresentationLayer.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        //---Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<IAddressService, AddressService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IEVDetailService, EVDetailService>();
        services.AddScoped<IBatteryDetailService, BatteryDetailService>();
        services.AddScoped<IHistorySoldService, HistorySoldService>();
        services.AddScoped<ISellerDashboardService, SellerDashboardService>();
        services.AddScoped<IAuctionService, AuctionService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IOrderItemService, OrderItemService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IUploadService, UploadService>();
        services.AddScoped<IItemImageService, ItemImageService>();
        services.AddScoped<ISellerService, SellerService>();
        services.AddScoped<IManagerDashboardService, ManagerDashboardService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ICommissionService, CommissionService>();
        services.AddScoped<IProfanityFilterService, ProfanityFilterService>();
        services.AddScoped<IMailService, MailService>();
        services.AddScoped<IKYC_DocumentService, KYC_DocumentService>();
        services.AddScoped<IStaffManagementService, StaffManagementService>();
        services.AddScoped<INewsService, NewsService>();
        services.AddSingleton<INotificationService, NotificationService>();
        services.AddScoped<IComplaintService, ComplaintService>();
        services.AddScoped<IWalletService, WalletService>();
        services.AddSingleton<IProfanityCountService, ProfanityCountService>();
        

        //---Repositories
        services.AddScoped<IAuctionRepository, AuctionRepository>();
        services.AddScoped<IAddressRepository, AddressRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IEVDetailRepository, EVDetailRepository>();
        services.AddScoped<IBatteryDetailRepository, BatteryDetailRepository>();
        services.AddScoped<IHistorySoldRepository, HistorySoldRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
        services.AddScoped<IBidRepository, BidRepository>();
        services.AddScoped<IWalletRepository, WalletRepository>();
        services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
        services.AddScoped<IPaymentDetailRepository, PaymentDetailRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IOrderItemRepository, OrderItemRepository>();
        services.AddScoped<IItemImageRepository, ItemImageRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IComplaintRepository, ComplaintRepository>();
        services.AddScoped<ICommissionFeeRuleRepository, CommissionFeeRuleRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IEmailRepository, EmailTemplateRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IKYC_DocumentRepository, KYC_DocumentRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IStaffPermissionRepository, StaffPermissionRepository>();
        services.AddScoped<INewsRepository, NewsRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IComplaintRepository, ComplaintRepository>();

        //IUnitOfWork
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        //Validators
        services.AddScoped<IValidator<PaymentRequestDto>, PaymentRequestValidator>();

        //--- AutoMapper
        services.AddAutoMapper(
            typeof(KYC_DocumentProfile).Assembly,
            typeof(AddressProfile).Assembly,
            typeof(ReviewProfile).Assembly,
            typeof(PermissionProfille).Assembly
        );
        return services;
    }
}