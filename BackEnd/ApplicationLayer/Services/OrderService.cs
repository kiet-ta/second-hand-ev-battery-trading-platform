using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<OrderService> _logger;
        public OrderService( IUnitOfWork unitOfWork, ILogger<OrderService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");


            return new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                CreatedAt = order.CreatedAt
                //Items = order.OrderItems?.Select(i => new OrderItemDto
                //{
                //    ItemId = i.ItemId,
                //    Quantity = i.Quantity,
                //    Price = i.Price
                //}).ToList()
            };
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _unitOfWork.Orders.GetAllAsync();
            if (orders == null || !orders.Any())
                throw new Exception("No orders found.");
            return orders.Select(order => new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                CreatedAt = order.CreatedAt
            });
        }

        public async Task<int> CreateOrderAsync(OrderDto dto)
        {
            if (dto == null)
                throw new Exception("Order data cannot be null.");

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var order = new Order
                {
                    BuyerId = dto.BuyerId,
                    AddressId = dto.AddressId,
                    CreatedAt = dto.CreatedAt,
                    UpdatedAt = dto.UpdatedAt,
                };

                await _unitOfWork.Orders.AddAsync(order);

                if (order.OrderId <= 0)
                    throw new Exception("Failed to create new order and retrieve OrderId.");

                if (dto.Items != null && dto.Items.Any())
                {
                    foreach (var itemDto in dto.Items)
                    {
                        var currentQuantity = await _unitOfWork.Items.GetCurrentItemQuantityAsync(itemDto.ItemId);
                        if (currentQuantity < itemDto.Quantity)
                        {
                            throw new Exception($"Item with ID {itemDto.ItemId} does not have enough quantity in stock. Available: {currentQuantity}, Requested: {itemDto.Quantity}.");
                        }

                        var orderItem = new OrderItem
                        {
                            OrderId = order.OrderId,
                            ItemId = itemDto.ItemId,
                            Quantity = itemDto.Quantity,
                        };

                        await _unitOfWork.OrderItems.CreateAsync(orderItem);

                        await _unitOfWork.Items.UpdateItemQuantityAsync(itemDto.ItemId, itemDto.Quantity);
                    }
                    await _unitOfWork.CommitTransactionAsync();
                }
                else
                {
                    await _unitOfWork.CommitTransactionAsync();
                }

                return order.OrderId;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                throw new Exception("Order creation and inventory update failed.", ex);
            }
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(dto.OrderId);
            if (order == null)
                throw new Exception($"Order with ID {dto.OrderId} not found.");

            order.UpdatedAt = DateTime.Now;
            await _unitOfWork.Orders.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
             var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");
            await _unitOfWork.Orders.DeleteAsync(id);
            return true;
        }
        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {

            var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId);
            if (orders == null || orders.Count == 0)
                throw new Exception($"No orders found for user ID {userId}.");
            return orders;

        }

        public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            if (request == null)
                throw new Exception("Order request cannot be null.");

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var orderItems = await _unitOfWork.OrderItems.GetItemsByIdsAsync(request.OrderItemIds);
                if (!orderItems.Any())
                {
                    throw new InvalidOperationException("No valid order items found.");
                }

                foreach (var item in orderItems)
                {
                    await _unitOfWork.Items.UpdateItemQuantityAsync(item.ItemId, item.Quantity);
                }

                var order = new Order
                {
                    BuyerId = request.BuyerId,
                    AddressId = request.AddressId,
                    ShippingPrice = request.ShippingPrice,
                    CreatedAt = request.CreatedAt,
                    UpdatedAt = request.UpdatedAt
                };

                var createdOrder = await _unitOfWork.Orders.AddOrderAsync(order);
                if (createdOrder == null)
                {
                    throw new Exception("Failed to create order.");
                }

                foreach (var item in orderItems)
                {
                    item.Status = OrderItemStatus.Pending.ToString();
                    item.UpdatedAt = DateTime.Now;
                    item.OrderId = createdOrder.OrderId;
                }

                await _unitOfWork.OrderItems.UpdateRangeAsync(orderItems);

                await _unitOfWork.CommitTransactionAsync();

                
                foreach (var item in orderItems)
                {
                    var sellerId = (await _unitOfWork.Items.GetByIdAsync(item.ItemId)).UpdatedBy;
                    var notificationDto = new CreateNotificationDto
                    {
                        NotiType = "Activities",
                        TargetUserId = sellerId.ToString(),
                        Title = "Bạn đã có một đơn hàng cần duyệt.",
                        Message = "Vui lòng kiểm tra lịch sử đơn hàng để biết thêm chi tiết."
                    };

                    await _unitOfWork.Notifications.AddNotificationAsync(notificationDto, 1, "Manager");
                }

                var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(request.BuyerId);
                
                var response = new OrderResponseDto
                {
                    OrderId = createdOrder.OrderId,
                    BuyerId = createdOrder.BuyerId,
                    AddressId = createdOrder.AddressId,
                    CreatedAt = createdOrder.CreatedAt,
                    isDeleted = false,
                    Items = orderItems.Select(x => new OrderItemDto
                    {
                        OrderItemId = x.OrderItemId,
                        OrderId = x.OrderId,
                        ItemId = x.ItemId,
                        Quantity = x.Quantity,
                    }).ToList()
                };

                return response;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Order creation failed and transaction rolled back. Error: {ex.Message}", ex);
            }
        }
        public async Task ConfirmOrderShippingAsync(int orderId, int sellerId)
        {
            var orderItems = await _unitOfWork.OrderItems.GetByIdAsync(orderId);
            if (orderItems == null) throw new Exception("Order not found.");

            // Check correct flow
            if (orderItems.Status != OrderItemStatus.Paid.ToString())
                throw new InvalidOperationException("Order is not in 'paid' state.");

            orderItems.Status = OrderItemStatus.Shipped.ToString();
            orderItems.UpdatedAt = DateTime.Now;
            await _unitOfWork.OrderItems.UpdateAsync(orderItems);

        }
        public async Task ConfirmOrderDeliveryAsync(int orderId, int buyerId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var orderItem = (await _unitOfWork.OrderItems.GetByOrderIdAsync(orderId)).FirstOrDefault();
                if (orderItem == null) throw new InvalidOperationException("Order item not found.");
                // Check correct flow
                if (orderItem.Status != OrderItemStatus.Shipped.ToString())
                    throw new InvalidOperationException("Order is not in 'shipped' state.");

                // 1. Get information (Seller, amount)

                decimal orderAmount = orderItem.Price; // This is the amount the buyer paid.
                var itemWithSeller = await _unitOfWork.Items.GetItemAndSellerByItemIdAsync(orderItem.ItemId);
                if (itemWithSeller?.Seller == null) throw new InvalidOperationException("Seller not found.");

                int sellerId = itemWithSeller.Seller.UserId;
                var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
                if (sellerWallet == null) throw new InvalidOperationException("Seller wallet not found.");

                // 2. Payout Calculation (The "final boss" logic)
                decimal commissionFee = 0; // TODO: commission
                decimal amountToSeller = orderAmount - commissionFee;

                // 3.Transfer money to Seller wallet
                bool updateSellerWallet = await _unitOfWork.Wallets.UpdateBalanceAsync(sellerWallet.WalletId, amountToSeller);
                if (!updateSellerWallet)
                    throw new Exception($"Failed to update seller wallet {sellerWallet.WalletId}.");

                // 4. Create "Payout" Transaction for Seller
                var payoutTransaction = new WalletTransaction
                {
                    WalletId = sellerWallet.WalletId,
                    Amount = amountToSeller,
                    Type = "payout", // là status nào
                    CreatedAt = DateTime.Now,
                    RefId = orderItem.OrderId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(payoutTransaction);

                _logger.LogInformation($"Released {amountToSeller} to Seller {sellerId} for Order {orderId}.");

                // 5. Update Order Status
                orderItem.Status = OrderItemStatus.Completed.ToString();
                orderItem.UpdatedAt = DateTime.Now;
                await _unitOfWork.OrderItems.UpdateAsync(orderItem);

                await _unitOfWork.CommitTransactionAsync();
                // TODO: Send notification to Seller "You have received the money"
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing Order {OrderId}. Rolling back.", orderId);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
