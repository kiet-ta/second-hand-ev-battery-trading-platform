using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
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
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<OrderService> _logger;
        public OrderService(IOrderRepository orderRepository, IOrderItemRepository orderItemRepository, IUnitOfWork unitOfWork, ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");


            return new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status,
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
            var orders = await _orderRepository.GetAllAsync();
            if (orders == null || !orders.Any())
                throw new Exception("No orders found.");
            return orders.Select(order => new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            });
        }

        public async Task<int> CreateOrderAsync(OrderDto dto)
        {
            if (dto == null)
                throw new Exception("Order data cannot be null.");
            var order = new Order
            {
                BuyerId = dto.BuyerId,
                AddressId = dto.AddressId,
                Status = OrderStatus.Pending.ToString(),
                CreatedAt = dto.CreatedAt, //DateTime.Now,
                UpdatedAt = dto.UpdatedAt, //DateTime.Now,
                //OrderItems = dto.Items?.Select(i => new OrderItem
                //{
                //    ItemId = i.ItemId,
                //    Quantity = i.Quantity,
                //    Price = i.Price
                //}).ToList()
            };
            await _orderRepository.AddAsync(order);
            if (order.OrderId <= 0)
                throw new Exception("Failed to create new order.");
            
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            if (order == null)
                throw new Exception($"Order with ID {dto.OrderId} not found.");

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.Now;
            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
             var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");
            await _orderRepository.DeleteAsync(id);
            return true;
        }
        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {

            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            if (orders == null || orders.Count == 0)
                throw new Exception($"No orders found for user ID {userId}.");
            return orders;

        }

        public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            if (request == null)
                throw new Exception("Order request cannot be null.");

            // Step 1: Validate items
            var orderItems = await _orderItemRepository.GetItemsByIdsAsync(request.OrderItemIds);
            if (!orderItems.Any())
                throw new InvalidOperationException("No valid order items found");


            // Step 2: Create order
            var order = new Order
            {
                BuyerId = request.BuyerId,
                AddressId = request.AddressId,
                Status = OrderStatus.Pending.ToString(),
                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt

            };
            var createdOrder = await _orderRepository.AddOrderAsync(order);
            if (createdOrder == null)
                throw new Exception("Failed to create order.");

            // Step 3: Update order items
            foreach (var item in orderItems)
            {
                item.OrderId = createdOrder.OrderId;
            }

            await _orderItemRepository.UpdateRangeAsync(orderItems);

            // Step 4: Build response
            var response = new OrderResponseDto
            {
                OrderId = createdOrder.OrderId,
                BuyerId = createdOrder.BuyerId,
                AddressId = createdOrder.AddressId,
                Status = createdOrder.Status,
                CreatedAt = createdOrder.CreatedAt,
                isDeleted = true,
                Items = orderItems.Select(x => new OrderItemDto
                {
                    OrderItemId = x.OrderItemId,
                    OrderId = x.OrderId,
                    ItemId = x.ItemId,
                    Quantity = x.Quantity,
                    Price = x.Price
                }).ToList()
            };

            return response;
        }
        public async Task ConfirmOrderShippingAsync(int orderId, int sellerId)
        {
            // TODO: Validate sellerId (ensure correct seller of this order)
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null) throw new Exception("Order not found.");

            // Check correct flow
            if (order.Status != "paid")
                throw new InvalidOperationException("Order is not in 'paid' state.");

            order.Status = "shipped";
            order.UpdatedAt = DateTime.Now;
            await _orderRepository.UpdateAsync(order);

            // TODO: Send notification to Buyer "Order is being delivered"
        }
        public async Task ConfirmOrderDeliveryAsync(int orderId, int buyerId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var order = await _orderRepository.GetByIdAsync(orderId);
                if (order == null) throw new Exception("Order not found.");
                if (order.BuyerId != buyerId) throw new Exception("Unauthorized."); // Check correct Buyer

                // Check correct flow
                if (order.Status != "shipped")
                    throw new InvalidOperationException("Order is not in 'shipped' state.");

                // 1. Get information (Seller, amount)
                var orderItem = (await _unitOfWork.OrderItems.GetByOrderIdAsync(orderId)).FirstOrDefault();
                if (orderItem == null) throw new InvalidOperationException("Order item not found.");

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
                    Type = "payout",
                    CreatedAt = DateTime.Now,
                    RefId = order.OrderId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(payoutTransaction);

                _logger.LogInformation($"Released {amountToSeller} to Seller {sellerId} for Order {orderId}.");

                // 5. Update Order Status
                order.Status = OrderStatus.Completed.ToString()   ;
                order.UpdatedAt = DateTime.Now;
                await _orderRepository.UpdateAsync(order);

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
