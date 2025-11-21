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
            var orders = await _unitOfWork.Orders.GetAllAsync();
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

            // Bắt đầu Transaction
            // Sử dụng await vì UnitOfWork.BeginTransactionAsync() là async
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 1. TẠO ORDER
                var order = new Order
                {
                    BuyerId = dto.BuyerId,
                    AddressId = dto.AddressId,
                    Status = OrderStatus.Pending.ToString(),
                    CreatedAt = dto.CreatedAt,
                    UpdatedAt = dto.UpdatedAt,
                };

                // **LƯU Ý QUAN TRỌNG:** Phương thức AddAsync trong repository của bạn 
                // cần phải gọi SaveChanges() (hoặc UnitOfWork.SaveChangesAsync())
                // để có được OrderId trước khi tiếp tục. 
                // Nếu AddAsync chỉ Add entity mà không SaveChanges, OrderId sẽ là 0.
                // Tuy nhiên, theo logic bạn cung cấp ở các lần trước,
                // _unitOfWork.Orders.AddAsync(order) đã gọi SaveChanges() để lấy OrderId.

                await _unitOfWork.Orders.AddAsync(order);

                if (order.OrderId <= 0)
                    // Nếu AddAsync() chưa gọi SaveChanges, nó sẽ bị lỗi ở đây
                    throw new Exception("Failed to create new order and retrieve OrderId.");

                // 2. TẠO ORDER ITEMS VÀ TRỪ KHO (ITEM QUANTITY)
                if (dto.Items != null && dto.Items.Any())
                {
                    foreach (var itemDto in dto.Items)
                    {
                        // Kiểm tra xem Item còn đủ số lượng không trước khi trừ
                        var currentQuantity = await _unitOfWork.Items.GetCurrentItemQuantityAsync(itemDto.ItemId);
                        if (currentQuantity < itemDto.Quantity)
                        {
                            // Nếu không đủ, ném ngoại lệ để kích hoạt Rollback
                            throw new Exception($"Item with ID {itemDto.ItemId} does not have enough quantity in stock. Available: {currentQuantity}, Requested: {itemDto.Quantity}.");
                        }

                        // Tạo OrderItem entity
                        var orderItem = new OrderItem
                        {
                            OrderId = order.OrderId, // Gán OrderId vừa được tạo
                            ItemId = itemDto.ItemId,
                            Quantity = itemDto.Quantity,
                            Price = itemDto.Price,
                            // ... các trường khác
                        };

                        // Thêm OrderItem (Không gọi SaveChanges ở đây, vì CommitTransactionAsync sẽ làm việc đó)
                        // Giả định OrderItems.CreateAsync() chỉ Add Entity vào Context
                        await _unitOfWork.OrderItems.CreateAsync(orderItem);

                        // TRỪ KHO: Cập nhật số lượng Item (Không gọi SaveChanges ở đây)
                        // Giả định Items.UpdateItemQuantityAsync() chỉ thay đổi trạng thái entity/hoặc dùng ExecuteUpdateAsync
                        await _unitOfWork.Items.UpdateItemQuantityAsync(itemDto.ItemId, itemDto.Quantity);
                    }

                    // 3. COMMIT TRANSACTION
                    // CommitTransactionAsync sẽ gọi SaveChanges() cho tất cả các thay đổi (OrderItems, Item Stock)
                    // sau đó gọi CommitAsync() trên IDbContextTransaction.
                    await _unitOfWork.CommitTransactionAsync();
                }
                else // Xử lý trường hợp không có Order Items
                {
                    // Nếu chỉ tạo Order mà không có Item, vẫn cần Commit/Rollback.
                    // Nếu AddAsync đã gọi SaveChanges, bạn chỉ cần Commit ở đây
                    await _unitOfWork.CommitTransactionAsync();
                }

                return order.OrderId;
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, Rollback Transaction
                // RollbackTransactionAsync sẽ tự dispose transaction
                await _unitOfWork.RollbackTransactionAsync();

                // Log lỗi
                throw new Exception("Order creation and inventory update failed.", ex);
            }
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(dto.OrderId);
            if (order == null)
                throw new Exception($"Order with ID {dto.OrderId} not found.");

            order.Status = dto.Status;
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

            // Bắt đầu Transaction
            await _unitOfWork.BeginTransactionAsync(); // Giả định phương thức này tồn tại

            try
            {
                // Step 1: Validate and fetch items
                var orderItems = await _unitOfWork.OrderItems.GetItemsByIdsAsync(request.OrderItemIds);
                if (!orderItems.Any())
                {
                    throw new InvalidOperationException("No valid order items found.");
                }

                // --- Bắt đầu Logic Trừ Kho và Liên kết Order Items ---

                // 1. Kiểm tra tồn kho và trừ kho
                foreach (var item in orderItems)
                {
                    // Sử dụng Item Repository để thực hiện kiểm tra và trừ kho
                    // UpdateItemQuantityAsync sẽ ném ngoại lệ nếu số lượng không đủ, 
                    // kích hoạt khối catch và rollback.
                    await _unitOfWork.Items.UpdateItemQuantityAsync(item.ItemId, item.Quantity);
                }

                // 2. Tạo Order
                var order = new Order
                {
                    BuyerId = request.BuyerId,
                    AddressId = request.AddressId,
                    Status = OrderStatus.Pending.ToString(),
                    CreatedAt = request.CreatedAt,
                    UpdatedAt = request.UpdatedAt
                };

                // **Lưu ý:** AddOrderAsync chỉ nên Add Entity và KHÔNG gọi SaveChanges() 
                // để tất cả thay đổi (trừ kho, Order, OrderItems) được lưu cùng lúc.
                var createdOrder = await _unitOfWork.Orders.AddOrderAsync(order);
                if (createdOrder == null)
                {
                    throw new Exception("Failed to create order.");
                }

                // 3. Liên kết OrderItems với Order mới tạo
                foreach (var item in orderItems)
                {
                    // Gán OrderId. Vì Order này chưa được SaveChanges, chúng ta cần Order Entity 
                    // được theo dõi (tracked) để có OrderId sau khi SaveChanges. 
                    // Nếu AddOrderAsync không gọi SaveChanges, OrderId của 'order' sẽ là 0
                    // cho đến khi CommitTransactionAsync được gọi.
                    // PHẢI dùng OrderId của entity sau khi Add (hoặc sau SaveChanges đầu tiên).
                    // Nếu AddOrderAsync trả về Order đã được SaveChanges (như trong code gốc của bạn), 
                    // thì createdOrder.OrderId đã có giá trị.
                    item.OrderId = createdOrder.OrderId;
                }

                // 4. Cập nhật OrderItems (Gán OrderId cho các OrderItem đã có)
                await _unitOfWork.OrderItems.UpdateRangeAsync(orderItems);

                // --- Kết thúc Logic nghiệp vụ ---

                // Commit Transaction: Lưu tất cả thay đổi (Order, OrderItems, Item Stock)
                await _unitOfWork.CommitTransactionAsync();


                // Step 5: Gửi thông báo
                foreach (var item in orderItems)
                {
                    // Lấy SellerId và gửi thông báo
                    var sellerId = (await _unitOfWork.Items.GetByIdAsync(item.ItemId)).UpdatedBy;
                    var notificationDto = new CreateNotificationDto
                    {
                        NotiType = "Activities",
                        TargetUserId = sellerId.ToString(),
                        Title = "Bạn đã có một đơn hàng cần duyệt.",
                        Message = "Vui lòng kiểm tra lịch sử đơn hàng để biết thêm chi tiết."
                    };
                    // Thao tác gửi thông báo thường không cần nằm trong Transaction chính.
                    await _unitOfWork.Notifications.AddNotificationAsync(notificationDto, 1, "Manager");
                }

                // Step 6: Build response
                var response = new OrderResponseDto
                {
                    OrderId = createdOrder.OrderId,
                    BuyerId = createdOrder.BuyerId,
                    AddressId = createdOrder.AddressId,
                    Status = createdOrder.Status,
                    CreatedAt = createdOrder.CreatedAt,
                    isDeleted = false, // Thay đổi thành false nếu đơn hàng mới tạo
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
            catch (Exception ex)
            {
                // Nếu có lỗi (ví dụ: trừ kho thất bại), Rollback Transaction
                await _unitOfWork.RollbackTransactionAsync(); // Giả định phương thức này tồn tại
                throw new Exception($"Order creation failed and transaction rolled back. Error: {ex.Message}", ex);
            }
        }
        public async Task ConfirmOrderShippingAsync(int orderId, int sellerId)
        {
            // TODO: Validate sellerId (ensure correct seller of this order)
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
            if (order == null) throw new Exception("Order not found.");

            // Check correct flow
            if (order.Status != OrderStatus.Paid.ToString())
                throw new InvalidOperationException("Order is not in 'paid' state.");

            order.Status = OrderStatus.Shipped.ToString()  ;
            order.UpdatedAt = DateTime.Now;
            await _unitOfWork.Orders.UpdateAsync(order);

            // TODO: Send notification to Buyer "Order is being delivered"
        }
        public async Task ConfirmOrderDeliveryAsync(int orderId, int buyerId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
                if (order == null) throw new Exception("Order not found.");
                if (order.BuyerId != buyerId) throw new Exception("Unauthorized."); // Check correct Buyer

                // Check correct flow
                if (order.Status != OrderStatus.Shipped.ToString())
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
                    Type = "payout", // là status nào
                    CreatedAt = DateTime.Now,
                    RefId = order.OrderId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(payoutTransaction);

                _logger.LogInformation($"Released {amountToSeller} to Seller {sellerId} for Order {orderId}.");

                // 5. Update Order Status
                order.Status = OrderStatus.Completed.ToString()   ;
                order.UpdatedAt = DateTime.Now;
                await _unitOfWork.Orders.UpdateAsync(order);

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
