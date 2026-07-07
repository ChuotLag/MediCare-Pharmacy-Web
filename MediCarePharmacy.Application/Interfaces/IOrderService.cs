using MediCarePharmacy.Application.Common;
using MediCarePharmacy.Application.DTOs.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCarePharmacy.Application.Interfaces
{
    public interface IOrderService
    {
        Task<ApiResponse<OrderDto>> CreateOrderAsync(Guid userId, CreateOrderRequest request);

        Task<ApiResponse<PagedResult<OrderDto>>> GetMyOrdersAsync(Guid userId, OrderQueryRequest request);

        Task<ApiResponse<OrderDto>> GetMyOrderByIdAsync(Guid userId, Guid orderId);

        Task<ApiResponse<bool>> CancelMyOrderAsync(Guid userId, Guid orderId);

        Task<ApiResponse<PagedResult<OrderDto>>> GetAllOrdersAsync(OrderQueryRequest request);

        Task<ApiResponse<OrderDto>> GetOrderByIdForAdminAsync(Guid orderId);

        Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request);
    }
}
